import { z } from "zod";

export type CustomerBackfillRecordKind = "ENQUIRY" | "TEST_DRIVE" | "SOURCING_REQUEST";
export type CustomerBackfillRecord = {
  kind: CustomerBackfillRecordKind;
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string | null;
  createdAt: Date | string;
};
export type ExistingCustomerForBackfill = {
  id: string;
  name: string;
  email: string | null;
  emailNormalized: string | null;
  phone: string | null;
  account: { status: string; emailVerifiedAt: Date | string | null } | null;
};
export type CustomerBackfillClassification =
  | "CANDIDATE_LINK_EXISTING_CUSTOMER"
  | "CANDIDATE_CREATE_CUSTOMER"
  | "REVIEW";
export type CustomerBackfillGroup = {
  normalizedEmail: string | null;
  classification: CustomerBackfillClassification;
  reasonCodes: string[];
  recommendedCustomerId: string | null;
  requestCount: number;
  records: Array<{
    kind: CustomerBackfillRecordKind;
    id: string;
    reference: string;
    customerName: string;
    email: string;
    phone: string | null;
    createdAt: string;
  }>;
  matchingCustomers: Array<{
    id: string;
    name: string;
    phone: string | null;
    hasAccount: boolean;
    accountStatus: string | null;
    emailVerifiedAt: string | null;
  }>;
};
export type CustomerBackfillPreview = {
  policy: {
    emailNormalization: "trim-and-lowercase-only";
    providerSpecificEmailRewriting: false;
    phoneComparison: "digits-only-without-country-code-conversion";
    writesToDatabase: false;
  };
  summary: {
    unlinkedRequests: number;
    candidateExistingCustomerGroups: number;
    candidateCreateCustomerGroups: number;
    reviewGroups: number;
    requestsInReviewGroups: number;
  };
  groups: CustomerBackfillGroup[];
};

export function normalizeCustomerEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized && z.email().safeParse(normalized).success ? normalized : null;
}

function normalizeCustomerName(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized || null;
}

function normalizePhoneForComparison(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function toIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function toRecordSummary(record: CustomerBackfillRecord) {
  return {
    kind: record.kind,
    id: record.id,
    reference: record.reference,
    customerName: record.customerName,
    email: record.email,
    phone: record.phone,
    createdAt: toIsoString(record.createdAt),
  };
}

function toCustomerSummary(customer: ExistingCustomerForBackfill) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    hasAccount: Boolean(customer.account),
    accountStatus: customer.account?.status ?? null,
    emailVerifiedAt: customer.account?.emailVerifiedAt
      ? toIsoString(customer.account.emailVerifiedAt)
      : null,
  };
}

function classifyGroup(
  records: CustomerBackfillRecord[],
  normalizedEmail: string,
  customers: ExistingCustomerForBackfill[],
): CustomerBackfillGroup {
  const reasons = new Set<string>();
  const names = new Set(records.map((record) => normalizeCustomerName(record.customerName)).filter((value): value is string => Boolean(value)));
  const phones = new Set(records.map((record) => normalizePhoneForComparison(record.phone)).filter((value): value is string => Boolean(value)));

  if (names.size !== 1) reasons.add("MULTIPLE_OR_MISSING_REQUEST_NAMES");
  if (phones.size > 1) reasons.add("MULTIPLE_REQUEST_PHONE_NUMBERS");
  if (customers.length > 1) reasons.add("MULTIPLE_EXISTING_CUSTOMER_RECORDS");

  let recommendedCustomerId: string | null = null;

  if (customers.length === 1) {
    const customer = customers[0];
    recommendedCustomerId = customer.id;

    const storedEmail = normalizeCustomerEmail(customer.emailNormalized);
    const rawEmail = normalizeCustomerEmail(customer.email);
    if (storedEmail && rawEmail && storedEmail !== rawEmail) {
      reasons.add("EXISTING_CUSTOMER_EMAIL_NORMALIZATION_MISMATCH");
    }

    if (customer.account && (!customer.account.emailVerifiedAt || customer.account.status !== "ACTIVE")) {
      reasons.add("EXISTING_CUSTOMER_ACCOUNT_NOT_VERIFIED_AND_ACTIVE");
    }

    const customerName = normalizeCustomerName(customer.name);
    if (!customerName || names.size !== 1 || !names.has(customerName)) {
      reasons.add("EXISTING_CUSTOMER_NAME_MISMATCH");
    }

    const customerPhone = normalizePhoneForComparison(customer.phone);
    const requestPhone = phones.size === 1 ? [...phones][0] : null;
    if (customerPhone && requestPhone && customerPhone !== requestPhone) {
      reasons.add("EXISTING_CUSTOMER_PHONE_MISMATCH");
    }
  }

  let classification: CustomerBackfillClassification = "REVIEW";
  if (reasons.size === 0) {
    classification = customers.length === 1
      ? "CANDIDATE_LINK_EXISTING_CUSTOMER"
      : "CANDIDATE_CREATE_CUSTOMER";
  } else if (customers.length !== 1) {
    recommendedCustomerId = null;
  }

  return {
    normalizedEmail,
    classification,
    reasonCodes: [...reasons].sort(),
    recommendedCustomerId,
    requestCount: records.length,
    records: records.map(toRecordSummary),
    matchingCustomers: customers.map(toCustomerSummary),
  };
}

/**
 * Builds a conservative candidate report only. This function performs no database operations.
 * Exact normalized email is the only grouping key; conflicting contact details require review.
 */
export function buildCustomerBackfillPreview(
  requests: CustomerBackfillRecord[],
  customers: ExistingCustomerForBackfill[],
): CustomerBackfillPreview {
  const requestGroups = new Map<string, CustomerBackfillRecord[]>();
  const invalidEmailRecords: CustomerBackfillRecord[] = [];

  for (const record of requests) {
    const email = normalizeCustomerEmail(record.email);
    if (!email) {
      invalidEmailRecords.push(record);
      continue;
    }
    const group = requestGroups.get(email) ?? [];
    group.push(record);
    requestGroups.set(email, group);
  }

  const customerGroups = new Map<string, ExistingCustomerForBackfill[]>();
  for (const customer of customers) {
    const storedEmail = normalizeCustomerEmail(customer.emailNormalized);
    const rawEmail = normalizeCustomerEmail(customer.email);
    const lookupEmails = new Set([storedEmail, rawEmail].filter((value): value is string => Boolean(value)));

    for (const normalizedEmail of lookupEmails) {
      const group = customerGroups.get(normalizedEmail) ?? [];
      group.push(customer);
      customerGroups.set(normalizedEmail, group);
    }
  }

  const groups: CustomerBackfillGroup[] = [];
  for (const [email, recordsForEmail] of requestGroups) {
    groups.push(classifyGroup(recordsForEmail, email, customerGroups.get(email) ?? []));
  }

  for (const record of invalidEmailRecords) {
    groups.push({
      normalizedEmail: null,
      classification: "REVIEW",
      reasonCodes: ["INVALID_OR_MISSING_EMAIL"],
      recommendedCustomerId: null,
      requestCount: 1,
      records: [toRecordSummary(record)],
      matchingCustomers: [],
    });
  }

  groups.sort((a, b) => (a.normalizedEmail ?? "").localeCompare(b.normalizedEmail ?? ""));

  const candidateExistingCustomerGroups = groups.filter(
    (group) => group.classification === "CANDIDATE_LINK_EXISTING_CUSTOMER",
  ).length;
  const candidateCreateCustomerGroups = groups.filter(
    (group) => group.classification === "CANDIDATE_CREATE_CUSTOMER",
  ).length;
  const reviewGroups = groups.filter((group) => group.classification === "REVIEW");

  return {
    policy: {
      emailNormalization: "trim-and-lowercase-only",
      providerSpecificEmailRewriting: false,
      phoneComparison: "digits-only-without-country-code-conversion",
      writesToDatabase: false,
    },
    summary: {
      unlinkedRequests: requests.length,
      candidateExistingCustomerGroups,
      candidateCreateCustomerGroups,
      reviewGroups: reviewGroups.length,
      requestsInReviewGroups: reviewGroups.reduce((total, group) => total + group.requestCount, 0),
    },
    groups,
  };
}
