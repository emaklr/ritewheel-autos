# Release 2 — Authentication & Identity Architecture

**Status:** Architecture approved; customer identity foundation and nullable request relationships merged; Development migrations applied; read-only backfill preview completed (no records to migrate); customer session and auth-token persistence added in the current PR; public authentication remains gated  
**Scope:** The Customer and CustomerAccount persistence foundation may be implemented independently without enabling registration or login. Public customer authentication remains gated by the prerequisites below.  
**Related:** [Release 2 scope](./RELEASE_2_SCOPE.md) · [Tracking issue #31](https://github.com/emaklr/ritewheel-autos/issues/31)

## 1. Confirmed product decisions

- Customer sessions have a **30-day absolute maximum lifetime** and a **7-day inactivity timeout**.
- Eligible guest enquiry history is **automatically linked only after successful email verification**.
- Email verification is mandatory for full customer account access.
- Public vehicle browsing remains guest-friendly.
- Customer and staff identities remain separate.
- Browser authentication uses opaque, database-backed cookie sessions, not JWT refresh-token authentication.

## 2. Architecture decision: adapt FixTrust, do not copy its auth module

Implement customer authentication natively in Ritewheel's Next.js App Router, PostgreSQL and Prisma architecture.

Ritewheel already has a working pattern in lib/admin-auth.ts: cryptographically random opaque session tokens, SHA-256 hashes stored in the database, HttpOnly cookies and server-side session validation. Extend the design for customers rather than importing a second framework's authentication stack.

**Reuse/adapt from FixTrust:**
- Argon2id password hashing policy.
- High-entropy, single-use verification and reset tokens stored as hashes.
- Purpose-bound tokens, expiry, atomic consumption and replay protection.
- Session revocation after password reset/security events.
- Enumeration-resistant recovery responses.
- Authentication rate-limit patterns and lifecycle test cases.
- A server-only transactional email provider abstraction, adapted to Ritewheel.

**Do not copy:** FixTrust's NestJS controllers/guards/modules, bearer access tokens, refresh-token rotation, or user/role schema. Those solve a different application/runtime problem.

## 3. Identity model

Keep three distinct concepts.

### Customer — CRM person record
A Customer exists whether or not the person registers. It is the canonical parent for enquiries, test-drive and sourcing requests, lead history, interactions, internal notes, follow-up tasks, vehicle interests and completed sales. Guest customers are valid CRM records.

### CustomerAccount — login identity
Proposed fields:
- id
- customerId (unique; one-to-one with Customer)
- email (unique canonical/normalized value)
- passwordHash
- emailVerifiedAt (nullable until verified)
- status (ACTIVE / DISABLED; pending verification may be represented by null emailVerifiedAt or an explicit pending state)
- createdAt, updatedAt, passwordChangedAt, optional lastLoginAt

The account owns credentials and security state; it does not replace Customer or own CRM history. Normalize email by trimming whitespace and applying a documented case-normalization policy. Do not apply provider-specific transformations such as removing Gmail dots. Email changes require verification of the new address before it becomes the login address.

### AdminUser — dealership personnel
Keep AdminUser separate from CustomerAccount. The current AdminUser role is a free-form string defaulting to ADMIN, and getCurrentAdmin() currently accepts only ADMIN. The target roles remain exactly OWNER and STAFF.

Migration rules:
- Deliberately map the existing active ADMIN account to OWNER.
- Preserve the existing account and its access; do not recreate or silently demote it.
- Unknown role values fail closed and require manual resolution.
- Staff deactivation revokes sessions but preserves historical actor IDs and audit history.
- Role migration and admin session compatibility need their own migration and regression tests.

## 4. Customer session architecture

Add a CustomerSession table separate from AdminSession.

Proposed fields: id, customerAccountId, tokenHash (unique), createdAt, lastSeenAt, expiresAt (idle deadline), absoluteExpiresAt (fixed maximum), and optional minimal non-sensitive metadata only if a retention policy is approved.

Generate at least 32 bytes of cryptographically secure random token material. Put the raw token only in the cookie; store only its SHA-256 hash. Never log or persist the raw token.

A session is valid only if:
1. Current time is before absoluteExpiresAt (30 days after creation).
2. Current time is before lastSeenAt + 7 days.

Authenticated activity may refresh lastSeenAt/idle expiry, with throttled database updates. It must never extend absoluteExpiresAt. Every protected request checks both deadlines in the database; cookie expiry is not the security boundary.

Each login creates a separate session. Release 2 must support logout-current and logout-all. Password reset, account disablement and other critical security events revoke all sessions. Unverified and disabled accounts cannot use protected customer features. A per-device session management screen is not required by this architecture.

Use a dedicated customer cookie, separate from the admin cookie, with HttpOnly, Secure in production, SameSite=Lax, Path=/ and a maximum browser age of 30 days. Do not store credentials or session tokens in localStorage, sessionStorage, URLs or client-readable cookies.

Centralize server-only helpers to resolve the current verified customer, require authentication, enforce ownership of customer records, resolve the current admin and enforce Owner/Staff permissions. Every protected page, route handler, server action and mutation must enforce authorization server-side. Public browsing stays public.

## 5. Authentication lifecycle

### Registration
- Validate and normalize all input on the server; rate-limit registration.
- Return generic responses that do not reveal whether an email is registered.
- Hash new customer passwords using Argon2id with parameters benchmarked on the actual Vercel runtime.
- Create/associate the Customer and pending CustomerAccount transactionally.
- Generate a cryptographically random, single-use verification token; store only its hash, purpose and expiry.
- Send the verification email through the configured provider.
- Do not issue a fully privileged session before verification.

### Email verification
Use a purpose-bound token record containing account ID, token hash, purpose, expiry, creation and consumption timestamps. Proposed expiry: **24 hours**. Replacing a token invalidates the old one. Consumption and account verification must be atomic and safe under concurrent requests. Successful verification sets emailVerifiedAt, consumes the token and triggers the guarded guest-history association in Section 6.

### Login and logout
Use generic credential failure responses for unknown email, wrong password and disabled accounts. Apply per-IP and per-account-key rate limits, with progressive throttling rather than permanent lockouts attackers could weaponise. Do not issue a session to unverified or disabled accounts. Logout revokes the current session server-side; logout-all revokes all account sessions.

### Password recovery/reset
Forgot-password always returns the same public response regardless of account existence. Apply rate limits. Reset tokens are random, single-use, purpose-bound, stored only as hashes and expire after a proposed **30 minutes**. Consume atomically, update the password hash, revoke all existing sessions, and require a normal login rather than silently signing the user in. Never log passwords or raw tokens.

### Change password/email
Require a verified session and current-password confirmation for password changes. Revoke other sessions after a password change. Email changes require verification of the new address; retain the old verified email until that succeeds. Send appropriate security notifications.

### Account closure
Do not cascade-delete CRM, sales or dealership records needed for legitimate retention. A retention/anonymisation policy must be approved before account closure is implemented; authentication code must not invent that policy.

## 6. Guest-to-account history linking

**Agreed behaviour:** after email verification, automatically associate eligible guest enquiries and requests matching the verified email. Typing an email during registration is not proof of ownership; verification is the gate.

Safety rules:
- Match only the exact normalized email recorded on the guest submission and the verified account email.
- Name, phone, IP, vehicle interest or browser storage must not independently establish identity. No fuzzy matching.
- Do not reveal matched records before verification.
- Link only records whose current Customer/account association is empty or otherwise unambiguously eligible.
- If multiple CRM Customer records match, or a request is already attached to a different Customer/account, preserve existing associations and flag for staff review. Never auto-merge or overwrite conflicting ownership.
- Preserve original request details, public references, timestamps and audit history.
- Perform linking transactionally and idempotently; repeated verification must not duplicate or corrupt associations.
- Record an auditable system event without logging tokens or unnecessary personal data.

Eligible legacy request types are Enquiry, TestDriveRequest and SourcingRequest. These models retain their original contact snapshots and now have nullable Customer relations. Existing records remain unlinked until a controlled, reviewed backfill. For future guest submissions, resolve/create a CRM Customer conservatively and attach the request. Shared family/business email addresses and duplicate CRM records mean email matches must not trigger destructive merges.

Ambiguous records remain unlinked until staff review. Phone-only or name-only matches are never automatically linked.

## 7. Email delivery

Create a small server-only email service abstraction with typed templates for verification, resend, password reset and security notifications. Use Resend as the proposed provider, consistent with FixTrust, behind an interface so provider code is isolated.

Production must validate the required API key, verified sender and canonical application URL. A development/test provider may capture safe metadata but must never be accepted in production. Use trusted configured URLs, not an untrusted Host header. Handle provider failure/retry safely; an email-send attempt must not consume a token. Do not commit secrets.

Before implementation, confirm the production sender domain, sender address and canonical application URL.

## 8. API security and rate limiting

The shared adapter in `lib/rate-limit.ts` uses **Upstash Redis with `@upstash/ratelimit` and `@upstash/redis`** for the existing Release 1 API limits. It uses sliding-window policies, disables the SDK's default allow-on-timeout behavior, disables the SDK's process-local ephemeral cache, and HMAC-hashes client identifiers before sending them to Redis. Missing credentials or Redis failures produce a service-unavailable result in deployed production/preview; a process-local fallback is retained only for local development. The six existing policies (admin login, Concierge, enquiry, purchase-interest, sourcing request and test-drive) preserve their current limits. Add distinct policies for customer registration, verification/resend, forgot-password, reset, password change and other sensitive customer operations when those endpoints are implemented. Vercel Firewall may provide an additional edge layer, but it does not replace application-level limits keyed by account/email identifiers.

Cookie authentication requires CSRF protection:
- Keep SameSite=Lax.
- Validate Origin against the configured canonical application origin for browser mutations.
- Define safe handling for missing Origin and non-browser requests; do not silently accept all missing Origin headers.
- Use a CSRF token where origin checks alone are insufficient.
- Trust forwarded host/protocol headers only from the trusted hosting platform.

The existing isSameOriginRequest() helper accepts a missing Origin header and must be reviewed before reuse for customer-authenticated mutations.

Validate every body, query and path parameter server-side using the existing Zod dependency or established project convention. Never log passwords, raw tokens or sensitive payloads. Use generic public errors but useful non-sensitive internal logs. Avoid shared/public caching of authenticated customer responses.

## 9. Password hashing and compatibility

Use Argon2id for new customer passwords. Before choosing a package, verify Node.js/Next.js/Vercel compatibility, CI and production build behaviour, and benchmark parameters. Choose one maintained implementation, not multiple libraries. Encoded hashes must retain algorithm parameters for future upgrades.

Existing admin credentials use a different hash implementation. Do not mass-reset or invalidate them. Preserve verification compatibility and consider gradual rehashing separately. A shared password service is acceptable only if it safely supports legacy admin hashes during transition.

## 10. Conceptual relationships (not a migration schema)

- Customer 1 — 0..1 CustomerAccount
- CustomerAccount 1 — many CustomerSession
- CustomerAccount 1 — many verification/reset token records
- Customer 1 — many Enquiry (nullable customerId while guest/legacy records remain unlinked)
- Customer 1 — many TestDriveRequest (nullable customerId while guest/legacy records remain unlinked)
- Customer 1 — many SourcingRequest (nullable customerId while guest/legacy records remain unlinked)

Request records retain existing public references and contact snapshots. Add nullable customerId relations first; do not make customer/account relations mandatory while legacy guest records remain unassociated.

CRM still needs a separate decision on whether Lead represents an individual enquiry or an ongoing sales opportunity. Authentication must not prematurely decide that.

## 11. Implementation sequence

1. Add Customer and CustomerAccount models and constraints without changing guest flows. This foundation introduces no public registration, login or session endpoints.
2. Add nullable Customer relations to request records (merged). Generate and inspect the read-only backfill preview. Do not write any associations until duplicate-handling rules and the complete report have been reviewed.
3. Add customer sessions and purpose-bound token persistence. This PR adds the database models and migration only; session/token lifecycle helpers and endpoints follow separately.
4. Add password hashing and email provider abstraction.
5. Implement registration, verification, login, logout, recovery and account security.
6. Enable guarded guest-history linking after verification.
7. Integrate account ownership into My Garage and customer features.
8. Add distributed rate limiting, CSRF/origin protection, security logging and production configuration.
9. Migrate AdminUser roles separately, preserving existing admin access.
10. Run regression, security and end-to-end checks before production rollout.

Do not enable customer registration before email delivery and distributed rate limiting are production-ready. Do not require Customer relations until legacy records are backfilled.

## 12. Required test coverage

- Password correctness, legacy admin hash compatibility, token expiry/single-use/replacement/replay and hashed-at-rest storage.
- Atomic concurrent verification/reset and idempotent guest linking.
- 30-day absolute and 7-day idle expiry; activity extends idle expiry only.
- Logout-current, logout-all, password-reset and account-disablement revocation.
- No protected access for unverified/disabled accounts.
- Generic registration/login/recovery responses prevent account enumeration.
- Customer A cannot access Customer B's garage, profile, requests, conversations or saved data by changing IDs.
- Staff cannot access customer account credentials, customer-private security data or staff-restricted operations.
- Guest linking requires exact verified email; no phone/name/fuzzy match; conflicting/duplicate associations remain unchanged and flagged.
- Email failure/retry, distributed rate limits, CSRF/origin checks and no sensitive logs.
- Existing guest request flows and existing admin login/workspace continue working.
- Build, lint, typecheck, migrations and end-to-end/security tests pass.

## 13. Remaining approval prerequisites

The two policy choices in Section 1 are settled. Before implementation, review these proposed defaults and dependencies:

1. **Email normalization:** trim and case-normalize for account uniqueness and exact guest matching; no provider-specific rewriting.
2. **Token expiry:** 24 hours for verification; 30 minutes for password reset.
3. **Session UI:** logout-current and logout-all only; no per-device management screen in Release 2.
4. **Account closure:** approve retention/anonymisation policy before implementation.
5. **Email operations:** confirm production sender domain, sender address and canonical app URL.
6. **Ambiguous guest records:** leave unlinked and send to staff review; never auto-merge conflicting Customers.
7. **Rate limiting:** Upstash Redis is selected and the shared adapter is implemented for existing Release 1 endpoints. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for local distributed-path testing and in Vercel Production/Preview before public authentication. Store integration credentials as Vercel Secrets, not readable Config values. Deployed production/preview requests must fail closed with a temporary service error if Upstash is missing or unavailable; only local development may use the process-local fallback.

The Upstash rate-limiting provider decision is approved. These remaining policy and production-configuration items are prerequisites, not silently assumed approvals.

## 14. Explicit non-goals and approval gate

This document does not authorize public customer registration or authentication until the production prerequisites below are satisfied. The approved Upstash adapter and the foundational Customer/CustomerAccount schema may be implemented independently; neither enables customer sign-in or changes existing guest request flows. It does not propose JWT browser authentication, a combined customer/staff identity table, social login, phone OTP, passwordless login, MFA, a device-management dashboard, Design Studio, checkout, payments, deposits or reservation holds.

**Implementation gate:** Do not enable public customer authentication until email delivery, Upstash credentials in local/Preview/Production environments, account-closure policy, CSRF/Origin enforcement and the required security tests are ready.


### Legacy request backfill preview

The read-only command `npm run customers:backfill:preview` produces a private JSON report for unlinked Enquiry, TestDriveRequest and SourcingRequest records. It is intentionally separate from any write operation.

Classification is conservative:
- Group request records only by exact email after trimming and lowercasing. Do not apply provider-specific transformations.
- Compare available names after case/whitespace normalization and phones as digits only; do not infer or rewrite country codes.
- Suggest a link to an existing Customer only when exactly one matching Customer exists, its stored/raw email values agree, and its name/available phone details do not conflict. If it has an account, that account must be active and email-verified.
- Suggest a new Customer candidate only when the request group has one consistent name and no conflicting phone values, and no existing Customer matches.
- Mark duplicate Customer rows, shared emails with different names or phone numbers, invalid emails, mismatched Customer details, and unverified/disabled accounts for staff review.

The output contains personal contact information and must remain in private local storage. The preview command uses database reads and writes only the report file. It does not create Customers, update request records, merge duplicate records or link accounts. A later write-enabled backfill must be a separate reviewed change and must consume an explicitly approved report rather than silently re-running candidate selection.
