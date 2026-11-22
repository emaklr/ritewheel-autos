# Release 2 — Customer Accounts & Dealership CRM

**Status:** Scope approved; customer identity foundation in progress; public customer authentication not enabled  
**Baseline:** `main` at the time this document was created  
**Product principle:** Keep the platform simple and operationally useful. Extend working Release 1 capabilities instead of rebuilding them.

## 1. Objective

Evolve Ritewheel Autos from a public vehicle marketplace into a connected dealership platform. Customers can manage their relationship with the dealership, while dealership staff can manage customers, enquiries, follow-ups, vehicles and completed sales.

This document is the product scope baseline for Release 2. It does not claim that any listed feature is implemented or verified.

## 2. Customer accounts and authentication

- Customer registration, login and logout.
- Email verification is required for full account access.
- Password recovery and reset.
- Secure, persistent sessions and password changes.
- Customer profile and account-security management.
- Account closure/deletion, subject to legitimate business-record retention requirements.
- Customers can browse the public marketplace without registering; accounts are required for persistent account features.
- Authentication must include appropriate rate limits, account-enumeration protections and secure session invalidation.

## 3. My Garage and customer preferences

- Persistent saved vehicles synchronised across a customer's devices.
- Saved comparisons, limited to three vehicles.
- Saved AI recommendations, including the reason for each recommendation and relevant preference context.
- Customer-editable vehicle preferences, such as make, vehicle type, budget, transmission, fuel type and intended use.
- Customer-editable notification preferences.
- Saved vehicles must reflect current inventory status, including unavailable or sold vehicles.
- Customers control their saved data; the AI must not silently change persistent preferences.

**Not included:** saved vehicle builds, configurations or Design Studio functionality.

## 4. AI Concierge account features

- Optional account-scoped conversation history.
- View, resume, start and delete conversations; clear conversation history.
- Save recommendations to My Garage.
- A customer may explicitly approve a concise conversation handover summary for dealership staff.
- Full conversations are not automatically shared with staff.
- AI remains grounded in published inventory and cannot promise availability, approve discounts, create reservations or make financial commitments.

## 5. Customer requests and notifications

Customers can view the status and history of their:
- Vehicle enquiries and callback requests.
- Test-drive requests.
- Vehicle sourcing requests.

Notifications:
- In-app and transactional email notifications for relevant acknowledgements and meaningful dealership updates.
- Customer notification preferences.
- WhatsApp is not a Release 2 dependency.
- Customer-facing status must reflect an actual recorded dealership action, not an assumed or AI-generated update.

## 6. Staff accounts and permissions

There are exactly two application roles in this release: **Owner** and **Staff**.

### Owner
- Create, deactivate/reactivate and remove staff access.
- Add, edit and manage vehicles, prices and availability.
- Manage customers, enquiries, leads and assignments.
- Record completed sales.
- View dealership-wide operational activity and records.
- Manage dealership settings.

### Staff
All staff share the same operational permissions:
- Add and edit vehicles.
- Change vehicle prices and availability; mark vehicles as sold.
- Manage customer records and enquiries.
- Record completed sales.
- Create and complete follow-up tasks.
- Log customer interactions.
- Add and view shared internal notes.

Staff cannot create, deactivate or remove other staff accounts, or change dealership-wide settings.

Staff access removal should normally deactivate the account rather than erase historical records. Important actions must retain the identity of the actor and their timestamps.

The existing admin workspace, authentication and vehicle-management routes are the starting point. Extend them; do not create a parallel admin system.

## 7. CRM

### Customer records
- A customer directory and individual customer profiles.
- Contact details, account association where registered, enquiries, vehicles of interest, test-drive and sourcing requests, assigned staff member, interaction history, shared internal notes, follow-up tasks and sales history.
- Guest enquiries must be represented even when the customer has no account.
- Prevent or reconcile duplicate customer records when an existing customer submits another enquiry.

### Lead management
- Capture incoming enquiries as leads or associate them with an existing customer and relevant lead history.
- Assign and reassign leads.
- Search and filter leads, including assigned and unassigned work.
- Track this simple lifecycle: **New → Assigned → Contacted → Interested → In Progress → Converted / Lost**.
- A lead is not Converted merely because the customer enquired or completed a test drive. Conversion requires a recorded completed sale.

### Activity timeline
Maintain a chronological history of important events, including:
- Enquiries received.
- Lead assignments and status changes.
- Customer interactions logged by staff.
- Test-drive and sourcing request updates.
- Follow-up task activity.
- Vehicle changes relevant to the customer relationship.
- Completed sales.

System actions should be recorded automatically where possible. Staff can manually log phone calls, meetings and other offline interactions.

### Shared internal notes
- Authorised staff can view shared notes attached to customer or lead records.
- Customers must never see internal notes.
- Each note records its author and creation time.
- Edits must not silently erase the historical record.

### Follow-up tasks
- Tasks are attached to a customer or lead.
- Each task has a title, description, assigned staff member, due date and status.
- Statuses: **Pending, Completed, Cancelled**.
- Staff can view upcoming and overdue tasks.
- Typical tasks include calling a customer, confirming an inspection, requesting test-drive feedback, following up on a negotiation or updating a customer about a sourcing request.

## 8. Sales records and vehicle lifecycle

A completed sale records:
- Customer.
- Vehicle.
- Sale price.
- Sale date.
- Responsible staff member.

When a vehicle is sold, its inventory status must update consistently. The vehicle record and relevant history must be retained; sold vehicles must not be deleted as a shortcut for removing them from active inventory.

This is a dealership sales record, not a payment or accounting system. Payment collection, deposits, balances and transaction processing are outside this release.

## 9. Security, data and engineering requirements

- Extend the existing PostgreSQL/Prisma schema and APIs; do not duplicate existing domain models or authentication systems.
- Enforce Owner/Staff authorisation on the server for every protected page and API operation.
- Enforce customer ownership on all customer-specific data and endpoints.
- Use secure password hashing, secure HttpOnly cookies and server-side session validation/invalidation.
- Validate all untrusted input on the server.
- Apply appropriate rate limits to authentication and sensitive endpoints.
- Record an audit trail for important dealership operations, including actor and timestamp.
- Use database transactions and idempotency where operations span related records or may be retried.
- Add appropriate indexes, pagination and efficient query patterns.
- Keep AI tools read-only with respect to trusted business operations unless an explicitly authorised application workflow mediates the action.
- Preserve Release 1 behaviour and performance; use server-rendered components by default and avoid unnecessary client-side bundles.

## 10. Explicit exclusions

The following are not Release 2 work:
- Vehicle Design Studio, vehicle configuration/builds, 3D visualisation or AI-generated vehicle images.
- Shopping cart, checkout, payment gateway, deposits or payment processing.
- Vehicle reservation holds.
- Supplier marketplace or external inventory feeds.
- Multi-dealership tenancy.
- Full real-time chat or WhatsApp integration.
- Full accounting or financial management.

**Vehicle Design Studio remains deferred until after all three releases are completed.** It must not be pulled into Release 1, Release 2 or Release 3 scope.

## 11. Proposed implementation sequence

The sequence is provisional and may be adjusted after the repository audit:

1. Repository and architecture audit; map existing Release 1 functionality, models, APIs, security and tests.
2. Customer authentication, email verification and account management.
3. My Garage, customer preferences and AI conversation persistence.
4. Owner/Staff accounts, role enforcement and integration with the existing admin workspace.
5. CRM: customer records, lead management, activity timeline, shared notes, follow-up tasks and sales records.
6. Notifications, end-to-end/security/performance testing and production deployment.

Do not create implementation tickets from assumptions before the audit. Audit findings should identify what already exists, what is incomplete, what is missing and what needs repair. Convert verified gaps into focused GitHub issues.

## 12. Release 2 acceptance criteria

Release 2 is complete only when:

- Customers can register, verify email and securely access accounts.
- Customers can manage their Garage and preferences across devices.
- Customers can save comparisons and AI recommendations.
- Customers can manage AI conversation history and explicitly control handover sharing.
- Customers can view their request history and relevant notifications.
- The Owner can create and deactivate/reactivate Staff accounts.
- Owner and Staff permissions are enforced server-side.
- Staff can use the existing vehicle-management workspace with the agreed operational permissions.
- Guest and registered customers are represented coherently in CRM records.
- Leads can be assigned, tracked and searched.
- Customer activity is recorded and visible to authorised staff.
- Staff can create and view shared internal notes.
- Follow-up tasks can be assigned, tracked and completed.
- Completed sales can be recorded and traced to the customer, vehicle and responsible staff member.
- Sold vehicle history is retained and inventory status remains consistent.
- Customer data is isolated by ownership; internal notes remain staff-only.
- Security, regression, end-to-end and production checks pass.
- Existing Release 1 functionality continues to work.

## 13. Working rules

- This document is the agreed Release 2 scope baseline.
- Audit before implementation; do not assume the README or prior summaries accurately describe current code.
- Do not rebuild existing working functionality without evidence that it needs replacement.
- Keep changes focused, reviewable and tested in GitHub branches and pull requests.
- Update this document only when a deliberate scope decision is made.
- Track implementation progress in GitHub Issues and pull requests; do not mark planned features complete without verification.
