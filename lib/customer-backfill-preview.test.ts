import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCustomerBackfillPreview,
  normalizeCustomerEmail,
  type CustomerBackfillRecord,
  type ExistingCustomerForBackfill,
} from "./customer-backfill-preview";

function record(overrides: Partial<CustomerBackfillRecord> = {}): CustomerBackfillRecord {
  return {
    kind: "ENQUIRY",
    id: "request-1",
    reference: "REF-1",
    customerName: "Ada Lovelace",
    email: "ADA@example.com",
    phone: "+234 801 234 5678",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function customer(overrides: Partial<ExistingCustomerForBackfill> = {}): ExistingCustomerForBackfill {
  return {
    id: "customer-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailNormalized: "ada@example.com",
    phone: "+234 801 234 5678",
    account: null,
    ...overrides,
  };
}

test("email normalization trims and lowercases without provider-specific rewriting", () => {
  assert.equal(normalizeCustomerEmail("  ADA@Example.COM "), "ada@example.com");
  assert.equal(normalizeCustomerEmail("ada.lovelace+cars@gmail.com"), "ada.lovelace+cars@gmail.com");
  assert.equal(normalizeCustomerEmail("adalovelace@gmail.com"), "adalovelace@gmail.com");
  assert.equal(normalizeCustomerEmail("not-an-email"), null);
  assert.equal(normalizeCustomerEmail(" "), null);
});

test("groups requests across request types using exact normalized email", () => {
  const preview = buildCustomerBackfillPreview([
    record(),
    record({
      kind: "TEST_DRIVE",
      id: "request-2",
      reference: "REF-2",
      email: "ada@example.com",
      phone: "+234 (801) 234-5678",
    }),
    record({
      kind: "SOURCING_REQUEST",
      id: "request-3",
      reference: "REF-3",
      email: "other@example.com",
      customerName: "Grace Hopper",
    }),
  ], []);

  assert.equal(preview.summary.unlinkedRequests, 3);
  assert.equal(preview.groups.length, 2);
  assert.equal(preview.groups[0].requestCount, 2);
  assert.equal(preview.groups[0].classification, "CANDIDATE_CREATE_CUSTOMER");
  assert.equal(preview.groups[1].classification, "CANDIDATE_CREATE_CUSTOMER");
});

test("does not normalize provider-specific email aliases into the same customer", () => {
  const preview = buildCustomerBackfillPreview([
    record({ email: "ada.lovelace@gmail.com" }),
    record({ id: "request-2", email: "adalovelace@gmail.com" }),
  ], []);
  assert.equal(preview.groups.length, 2);
});

test("suggests a unique existing Customer only when the contact details agree", () => {
  const preview = buildCustomerBackfillPreview([record()], [customer()]);
  assert.equal(preview.groups[0].classification, "CANDIDATE_LINK_EXISTING_CUSTOMER");
  assert.equal(preview.groups[0].recommendedCustomerId, "customer-1");
});

test("flags multiple CRM Customer records sharing the same email", () => {
  const preview = buildCustomerBackfillPreview(
    [record()],
    [customer(), customer({ id: "customer-2" })],
  );
  assert.equal(preview.groups[0].classification, "REVIEW");
  assert.ok(preview.groups[0].reasonCodes.includes("MULTIPLE_EXISTING_CUSTOMER_RECORDS"));
  assert.equal(preview.groups[0].recommendedCustomerId, null);
});

test("flags shared email used by different request names or phone numbers", () => {
  const differentNames = buildCustomerBackfillPreview([
    record(),
    record({ id: "request-2", customerName: "Grace Hopper" }),
  ], []);
  const differentPhones = buildCustomerBackfillPreview([
    record(),
    record({ id: "request-2", phone: "+234 802 000 0000" }),
  ], []);

  assert.equal(differentNames.groups[0].classification, "REVIEW");
  assert.ok(differentNames.groups[0].reasonCodes.includes("MULTIPLE_OR_MISSING_REQUEST_NAMES"));
  assert.equal(differentPhones.groups[0].classification, "REVIEW");
  assert.ok(differentPhones.groups[0].reasonCodes.includes("MULTIPLE_REQUEST_PHONE_NUMBERS"));
});

test("does not associate a request to an unverified or disabled customer account", () => {
  const preview = buildCustomerBackfillPreview([record()], [customer({
    account: { status: "DISABLED", emailVerifiedAt: null },
  })]);
  assert.equal(preview.groups[0].classification, "REVIEW");
  assert.ok(preview.groups[0].reasonCodes.includes("EXISTING_CUSTOMER_ACCOUNT_NOT_VERIFIED_AND_ACTIVE"));
});

test("flags existing Customer contact mismatches and normalization drift", () => {
  const preview = buildCustomerBackfillPreview([record()], [customer({
    name: "A. Lovelace",
    phone: "+234 809 999 9999",
    emailNormalized: "different@example.com",
  })]);
  assert.equal(preview.groups[0].classification, "REVIEW");
  assert.ok(preview.groups[0].reasonCodes.includes("EXISTING_CUSTOMER_EMAIL_NORMALIZATION_MISMATCH"));
  assert.ok(preview.groups[0].reasonCodes.includes("EXISTING_CUSTOMER_NAME_MISMATCH"));
  assert.ok(preview.groups[0].reasonCodes.includes("EXISTING_CUSTOMER_PHONE_MISMATCH"));
});

test("places missing or invalid emails into individual review groups", () => {
  const preview = buildCustomerBackfillPreview([
    record({ email: "" }),
    record({ id: "request-2", email: "invalid" }),
  ], []);
  assert.equal(preview.groups.length, 2);
  assert.equal(preview.summary.reviewGroups, 2);
  assert.equal(preview.summary.requestsInReviewGroups, 2);
  assert.ok(preview.groups.every((group) => group.reasonCodes.includes("INVALID_OR_MISSING_EMAIL")));
});

test("the preview explicitly declares that it never writes to the database", () => {
  const preview = buildCustomerBackfillPreview([record()], []);
  assert.equal(preview.policy.writesToDatabase, false);
});
