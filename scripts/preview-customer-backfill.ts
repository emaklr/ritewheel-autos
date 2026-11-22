import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  buildCustomerBackfillPreview,
  type CustomerBackfillRecord,
  type ExistingCustomerForBackfill,
} from "../lib/customer-backfill-preview";

const args = process.argv.slice(2);
const envFileArgument = args.find((argument) => argument.startsWith("--env-file="));
const requestedEnvFile = envFileArgument?.slice("--env-file=".length).trim();

if (!requestedEnvFile) {
  throw new Error(
    "Choose the database explicitly with --env-file=<path>. Use a development-only environment file; do not point this preview at production.",
  );
}

const envFilePath = resolve(process.cwd(), requestedEnvFile);
if (!existsSync(envFilePath)) {
  throw new Error(`The selected environment file does not exist: ${envFilePath}`);
}

// The explicitly selected file wins over any inherited shell variables, preventing
// a stale Production DATABASE_URL from overriding the selected development target.
loadEnv({ path: envFilePath, override: true });

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is missing from the selected environment file: ${envFilePath}`);
}

let databaseTarget = "unknown";
try {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  databaseTarget = `${databaseUrl.hostname}/${databaseUrl.pathname.replace(/^\\//, "")}`;
} catch {
  throw new Error("DATABASE_URL in the selected environment file is not a valid URL.");
}

console.log(`Using explicitly selected database target: ${databaseTarget}`);

const outputArgument = process.argv.slice(2).find((argument) => argument.startsWith("--out="));
const requestedOutput = outputArgument?.slice("--out=".length).trim();
const defaultFileName = `customer-backfill-preview-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
const outputPath = resolve(process.cwd(), requestedOutput || defaultFileName);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [
    customers,
    enquiries,
    testDrives,
    sourcingRequests,
    linkedEnquiries,
    linkedTestDrives,
    linkedSourcingRequests,
  ] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailNormalized: true,
        phone: true,
        account: { select: { status: true, emailVerifiedAt: true } },
      },
      orderBy: { id: "asc" },
    }),
    prisma.enquiry.findMany({
      where: { customerId: null },
      select: { id: true, reference: true, customerName: true, email: true, phone: true, createdAt: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    prisma.testDriveRequest.findMany({
      where: { customerId: null },
      select: { id: true, reference: true, customerName: true, email: true, phone: true, createdAt: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    prisma.sourcingRequest.findMany({
      where: { customerId: null },
      select: { id: true, reference: true, customerName: true, email: true, phone: true, createdAt: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    prisma.enquiry.count({ where: { customerId: { not: null } } }),
    prisma.testDriveRequest.count({ where: { customerId: { not: null } } }),
    prisma.sourcingRequest.count({ where: { customerId: { not: null } } }),
  ]);

  const requests: CustomerBackfillRecord[] = [
    ...enquiries.map((record) => ({ ...record, kind: "ENQUIRY" as const })),
    ...testDrives.map((record) => ({ ...record, kind: "TEST_DRIVE" as const })),
    ...sourcingRequests.map((record) => ({ ...record, kind: "SOURCING_REQUEST" as const })),
  ];
  const existingCustomers: ExistingCustomerForBackfill[] = customers;
  const preview = buildCustomerBackfillPreview(requests, existingCustomers);

  const report = {
    generatedAt: new Date().toISOString(),
    reportType: "READ_ONLY_CUSTOMER_BACKFILL_PREVIEW",
    note: "Contains customer contact information. Keep this report private; do not commit or upload it publicly.",
    linkedRequestCounts: {
      enquiries: linkedEnquiries,
      testDriveRequests: linkedTestDrives,
      sourcingRequests: linkedSourcingRequests,
      total: linkedEnquiries + linkedTestDrives + linkedSourcingRequests,
    },
    customerRecords: customers.length,
    ...preview,
  };

  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });

  console.log("Customer backfill preview completed. No database records were changed.");
  console.log(JSON.stringify({
    outputPath,
    customerRecords: report.customerRecords,
    ...report.linkedRequestCounts,
    ...preview.summary,
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error("Customer backfill preview failed:", error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
