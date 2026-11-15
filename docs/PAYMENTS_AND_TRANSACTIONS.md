# Ritewheel Autos — Quotations, Reservations and Payments

**Version:** 1.0  
**Status:** Future-release architecture; designed now, not implemented  
**Target:** Release 3, after customer accounts and CRM  
**Date:** 15 November 2026

## 1. Purpose and timing

Ritewheel is a vehicle marketplace, not a standard cart-based ecommerce shop. A payment must start from a dealership-verified quote, not directly from a vehicle card, an AI recommendation or a saved Garage item.

This document defines the future commercial and payment design now so the domain model, status lifecycles, security controls and backend boundaries do not need to be invented during implementation.

**Live payment processing is not part of Release 1.** Release 1 delivers discovery and lead capture. Release 2 adds customer accounts, My Garage, staff roles and CRM. Release 3 implements verified quotes, reservations, hosted checkout, webhooks, refunds, reconciliation and purchase tracking.

No payment provider has been selected. Do not assume Paystack, Flutterwave, Stripe, escrow or any specific gateway until due diligence is complete.

## 2. Purchase principles

1. **Quote first:** staff verifies the vehicle, condition, price, supply and terms before issuing a payable quote.
2. **No generic cart:** customers use My Garage for discovery and shortlisting; a quote is the formal purchase offer.
3. **Customer confirmation:** the customer reviews and accepts the exact quote version before payment.
4. **Server-authoritative money:** the browser never decides amount, currency, deposit or balance.
5. **Provider-independent application:** business services use a gateway adapter, not a provider SDK spread through the application.
6. **Webhook-authoritative confirmation:** a success redirect is not proof of payment.
7. **Idempotent financial operations:** retries and duplicated events cannot create duplicate charges or ledger postings.
8. **No card data storage:** use hosted checkout or approved provider components; do not store raw card numbers or CVV.
9. **Auditable money movement:** payments, refunds, adjustments and reservation changes have immutable references and audit trails.
10. **Reservation is not sale:** a hold, paid deposit, fully paid purchase and completed handover are separate states.

## 3. Future customer purchase journey

### Step 1 — Express interest
Customer selects Enquire, Request a Quote, Request a Test Drive or Request Sourcing. An AI recommendation or saved vehicle does not create a quote automatically.

### Step 2 — Human verification
A representative verifies:
- Current vehicle status and offerability.
- Condition, mileage, ownership and supporting documents.
- Current price and currency.
- Fees, taxes or delivery charges where applicable.
- Supplier/vehicle offer for a sourced vehicle.
- Reservation/hold policy.
- Customer's agreed purchase details.

For an externally sourced vehicle, staff must verify an actual supplier/vehicle offer before it can be quoted.

### Step 3 — Dealership issues a quote
The quote includes:
- Unique quote number and version.
- Customer identity/contact snapshot.
- Vehicle listing or sourcing reference.
- Itemised lines, amount and currency.
- Applicable taxes/fees when configured and reviewed.
- Total amount.
- Allowed payment options (deposit, full, balance or a configured schedule).
- Quote expiry.
- Reservation conditions and hold expiry, if relevant.
- Refund/cancellation terms.
- Terms-and-conditions version.
- Staff issuer and required approver.

A revision creates a new version. Accepted or paid quote versions are never silently edited.

### Step 4 — Customer accepts
Customer reviews total, line items, currency, expiry and terms, then explicitly accepts the exact quote version. Record accepted version, timestamp, identity, terms version and relevant request metadata.

A payable quote should be exposed only to a verified customer identity (or an explicitly reviewed verified-guest flow), not an unauthenticated guessable URL.

### Step 5 — Optional reservation/hold
If the quote requires a hold:
- Create the reservation only after server-side checks.
- Use a database transaction and conditional update/row locking to prevent two active holds on the same vehicle unit.
- Set and display a server-controlled hold expiry.
- Opening a quote or checkout does not reserve a car.
- If payment is still pending near expiry, reconcile provider status before releasing the vehicle.
- A confirmed deposit may confirm the hold under the quote policy, but does not mean the purchase is complete.

### Step 6 — Payment obligation and checkout
The server creates a payment obligation based on the accepted quote:
- Reservation deposit.
- Full payment.
- Remaining balance.
- Another explicitly configured dealership-approved payment stage.

Amount and currency come from the quote/obligation, not from client input. Create a unique idempotency key and PaymentAttempt, then ask the provider adapter for a hosted checkout session.

The browser return page shows processing/pending/success information, but is not authoritative.

### Step 7 — Verify and record payment
- Receive the provider webhook at a server-only route.
- Verify authenticity/signature using the provider's documented procedure.
- Store event ID with a unique constraint.
- Retrieve/verify the provider transaction if required.
- Match provider reference, internal reference, amount, currency and obligation.
- Process idempotently in a database transaction.
- Update PaymentAttempt and Payment.
- Allocate amount to the correct obligation.
- Write append-only journal entries.
- Update reservation/purchase state through allowed transitions.
- Notify the customer only after verified confirmation.

Unverified, delayed or mismatched events go to reconciliation; the browser return cannot mark the payment as paid.

### Step 8 — Balance and completion
A deposit is recorded as one verified payment. Remaining balance remains outstanding and can be paid through another obligation/payment. Authorised offline payments may be recorded only with evidence and an audit trail. Purchase completion requires all financial and operational checks, not just a deposit.

### Step 9 — Refunds and cancellation
Refunds are explicit authorised operations with original payment reference, amount/currency, reason, approver, provider reference, status and timestamps. Never delete or overwrite an original successful payment. A refund is a new reversing financial event.

## 4. Future domain model

These entities are introduced in Release 3. They are not required in the Release 1 database, but their relationships and invariants are established now.

### Quote
Suggested fields:
- id, quoteNumber, version, customerAccountId (or verified guest identity where allowed).
- vehicleId nullable, sourcingRequestId nullable.
- status: DRAFT, ISSUED, VIEWED, ACCEPTED, DECLINED, EXPIRED, SUPERSEDED, CANCELLED.
- currency, subtotal, fees, taxes, totalAmount.
- expiresAt, issuedAt, acceptedAt, acceptedByCustomerAt.
- termsVersion, reservationTerms, refundTerms.
- issuedByStaffId, approvedByStaffId, timestamps.

Rules:
- Quote references a real vehicle offer or verified sourcing offer.
- One currency per quote.
- Issued version is an immutable snapshot.
- Customer acceptance binds to the exact version.
- Revisions create a new version.

### QuoteLine
- id, quoteId, lineType, description, quantity, unitAmount, lineAmount, optional reviewed tax/fee metadata.
- Preserve issued descriptions and monetary values even if the vehicle record later changes.

### PaymentObligation
Represents an amount due under an accepted quote:
- id, quoteId, purchaseId, type (DEPOSIT, FULL_PAYMENT, BALANCE, FEE, OTHER).
- amountDue, currency, dueAt, status (PENDING, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED).
- Optional payment sequence/order.

The configured obligations must reconcile to the accepted quote total, including any clearly identified offline/non-payable line.

### VehicleReservation
- id, vehicleId, quoteId, customerAccountId, status, holdExpiresAt, confirmedAt, releasedAt, reason.
- Status: HOLD_PENDING_PAYMENT, CONFIRMED, EXPIRED, RELEASED, CANCELLED, CONVERTED_TO_PURCHASE.
- Conditional uniqueness/locking prevents more than one active reservation for a single vehicle unit.
- A reservation is neither a payment nor a completed purchase.

### Purchase / Deal
- id, quoteId, vehicleId nullable, sourcingRequestId nullable, customerAccountId.
- status: OPEN, DEPOSIT_PAID, PARTIALLY_PAID, PAID, DOCUMENTATION_PENDING, READY_FOR_HANDOVER, COMPLETED, CANCELLED, DISPUTED.
- currency, agreedTotal, amountPaid, amountOutstanding, timestamps.

Purchase is the commercial process record. Payment is a financial movement. Keep them separate.

### Payment
- id, purchaseId, paymentObligationId.
- providerKey, providerReference (unique in provider namespace).
- amount, currency.
- status: CREATED, PENDING, SUCCEEDED, FAILED, CANCELLED, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED, DISPUTED.
- idempotencyKey, initiatedAt, settledAt, timestamps.

Use decimal money fields and one currency per payment.

### PaymentAttempt
- id, paymentId, attemptNumber, providerCheckoutReference, providerTransactionReference.
- status: CREATED, REDIRECTED, PENDING, SUCCEEDED, FAILED, EXPIRED.
- Checkout URL only as needed and never as payment authority.
- Safe request/response metadata with secrets stripped.
- timestamps.

A retry creates a new attempt; it must not create a duplicate payment obligation.

### PaymentWebhookEvent
- id, providerKey, providerEventId, eventType, receivedAt, verifiedAt, processedAt, processingStatus, safePayloadMetadata.
- Unique providerKey + providerEventId.
- Store only information necessary for audit/replay; do not retain secrets or unnecessary sensitive payloads.

### Refund
- id, paymentId, providerRefundReference, amount, currency, reason, status, requestedBy, approvedBy, requestedAt, settledAt.
- Status: REQUESTED, APPROVED, SUBMITTED, PENDING, SUCCEEDED, FAILED, CANCELLED.
- Partial refunds are separate records; total successful refunds cannot exceed original settled amount.

### Financial journal
Use an append-only record instead of manually editing balances:
- JournalTransaction: id, sourceType, sourceId, currency, description, postedAt, createdAt.
- JournalEntry: id, journalTransactionId, accountCode, direction (DEBIT/CREDIT), amount, currency, reference.
- Each posted journal transaction balances debits and credits per currency.
- Corrections use reversing/correcting entries; posted entries are not edited or deleted.
- A finance owner/accountant must review chart-of-account mappings and accounting treatment before live launch. Do not assume revenue, tax, payable or customer-funds treatment.

### Audit and reconciliation
Record quote issue/revision/acceptance, reservation creation/release, checkout creation, webhook verification, payment/refund state changes, manual payment records and purchase completion. A reconciliation job compares internal records with provider transactions/refunds and surfaces amount/currency mismatch, duplicate/unknown events, delayed settlements, missing webhooks, failed refunds and unmatched transactions.

## 5. Provider adapter

Business services depend on a provider-independent interface. Implement one adapter only after provider selection.

Required capabilities:
- Create hosted checkout session.
- Verify webhook against raw body/headers as specified by provider.
- Fetch/verify transaction by provider reference.
- Create refund.
- Fetch/verify refund.
- Expose settlement/account status where provider offers it.

Keep SDK calls and provider-specific response shapes inside the adapter.

Provider evaluation:
- Nigerian business onboarding and settlement requirements.
- Supported customer methods and currencies.
- International card acceptance if required.
- Fees, settlement timelines and payout support.
- Hosted checkout quality and security.
- Webhook reliability, signatures and retry behaviour.
- Transaction lookup/reconciliation API.
- Full/partial refund and dispute support.
- Operational support, documentation and sandbox quality.
- Legal/regulatory/compliance fit for the dealership's business model.

Do not select a gateway solely because it is already used in another project.

## 6. Future API contract

Amounts and currencies are server-authoritative. Customer endpoints are account-scoped; staff endpoints are role-protected.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/admin/quotes` | Sales/Admin | Create a draft quote |
| PATCH | `/api/admin/quotes/:id/issue` | Approved Sales/Admin | Validate and issue a quote |
| GET | `/api/account/quotes` | Customer | List own quotes |
| GET | `/api/account/quotes/:id` | Customer | View own quote |
| POST | `/api/account/quotes/:id/accept` | Customer | Accept exact issued quote version |
| POST | `/api/account/quotes/:id/payments` | Customer | Create checkout for a valid obligation |
| GET | `/api/account/payments` | Customer | View own transactions |
| POST | `/api/webhooks/payments/:provider` | Provider webhook | Verify/process provider event |
| POST | `/api/admin/payments/:id/refunds` | Authorised Admin | Request/approve refund |
| GET | `/api/admin/transactions` | Finance/Admin | Search payments/refunds |
| POST | `/api/admin/transactions/reconcile` | Finance/Admin/System | Run/request reconciliation |

Webhook routes are not customer-authenticated; they depend on signature verification, unique event IDs, idempotency and strict schema validation.

## 7. State transitions and invariants

- Unissued draft quote cannot be paid.
- Expired, declined, cancelled or superseded quote cannot be accepted or paid.
- Acceptance binds to an exact quote version.
- Amount/currency must match the server-side obligation.
- One provider reference cannot be assigned to multiple payments.
- Browser redirects cannot mark payment successful.
- Payment becomes SUCCEEDED only after verified provider confirmation or a documented, approved offline payment workflow.
- Duplicate webhook delivery cannot duplicate payment/refund/journal records.
- A reservation is never confirmed by opening checkout.
- One vehicle unit cannot have two active holds.
- Payment failure does not mean vehicle sold.
- A deposit is not a completed purchase.
- Successful refunds cannot exceed original settled value.
- Posted journal entries are immutable and balanced per currency.
- Purchase completion requires all required financial and operational checks.

## 8. Security and operational controls

- Hosted checkout or approved provider components; never store raw card number/CVV.
- Gateway and webhook secrets stay server-side.
- Verify webhook signatures according to provider documentation.
- Enforce HTTPS, role/account access control, validation, rate limits and audit logging.
- Use idempotency keys for checkout creation and refunds.
- Verify amount, currency and reference against server records.
- Strip sensitive details from logs.
- Require appropriate staff role/approval for refunds and manual payment records.
- Establish refund, cancellation, reservation expiry and dispute procedures before charging real money.
- Get finance/legal review of taxes, receipts, refunds, customer disclosures and accounting treatment.
- Define data retention and support process.
- Issue receipt and notification only from verified transaction state.

This is engineering/product design, not legal, tax or accounting advice.

## 9. Failure and recovery

- **Checkout closed:** retain attempt as pending until provider state/expiry is checked; allow a safe retry.
- **Browser says success but webhook absent:** show Verifying payment; fetch/reconcile provider state; do not mark paid from redirect.
- **Duplicate webhook:** unique provider event and transaction idempotency prevent duplicate posting.
- **Out-of-order webhook:** validate state transitions and fetch provider's current transaction state when needed.
- **Provider unavailable:** do not create repeated attempts blindly; preserve obligation and offer retry later.
- **Amount/currency mismatch:** quarantine as an exception; do not allocate.
- **Reservation expires during pending payment:** check provider state before release.
- **Refund fails:** preserve original payment, mark refund failed and provide a support/retry path.
- **Settlement mismatch:** open reconciliation exception with evidence and audit trail.

## 10. Implementation schedule

### Design now
- Keep the future domain model and invariants documented.
- Keep Garage, sourcing, quote and transaction concepts distinct.
- Avoid cart-shaped tables and direct listing-to-checkout shortcuts.
- Do not create live payment endpoints, gateway credentials or checkout UI in Release 1.

### Release 2 preparation
- Deliver customer accounts, secure Garage, staff roles and CRM.
- Implement draft quote creation/review if useful, without live charging.
- Decide policies for deposit, reservation, full payment, refunds and expiry.
- Evaluate providers and complete a sandbox proof-of-concept.

### Release 3 implementation
1. Finalise provider selection and adapter.
2. Implement quote versioning, acceptance and payment obligations.
3. Implement reservation locking and expiry.
4. Implement hosted checkout and idempotent attempt creation.
5. Implement signed webhooks and provider verification.
6. Implement journal, refunds, receipts and reconciliation.
7. Add admin payment/exception views.
8. Run sandbox, security and failure-mode tests.
9. Complete finance/legal/operational review.
10. Enable live mode only after release gates pass.

## 11. Release acceptance checklist

- [ ] Only an issued and unexpired quote can be accepted.
- [ ] Quote version, terms, total and currency are immutable after acceptance.
- [ ] Server calculates payment amount.
- [ ] Vehicle cannot be double-reserved.
- [ ] Checkout creation is idempotent.
- [ ] Webhook signatures are verified.
- [ ] Duplicate/out-of-order events are safely handled.
- [ ] Browser redirect alone cannot confirm payment.
- [ ] Amount and currency are matched.
- [ ] Deposit and balance payments reconcile.
- [ ] Refunds are authorised and cannot exceed settled value.
- [ ] Journal postings are append-only and balanced.
- [ ] Failed/delayed payment and refund scenarios are tested.
- [ ] Customer/staff views are access-scoped.
- [ ] Receipts and notifications use verified state.
- [ ] Finance/legal/operational approvals exist before live charges.

---

**Core rule:** Ritewheel must never accept money against an unverified vehicle offer or treat an unverified browser response as a successful payment.
