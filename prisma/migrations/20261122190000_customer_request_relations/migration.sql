-- Add nullable Customer links to legacy request records.
-- Existing guest records remain unchanged and unlinked until a separately reviewed backfill.

ALTER TABLE "Enquiry"
ADD COLUMN "customerId" TEXT;

ALTER TABLE "TestDriveRequest"
ADD COLUMN "customerId" TEXT;

ALTER TABLE "SourcingRequest"
ADD COLUMN "customerId" TEXT;

CREATE INDEX "Enquiry_customerId_createdAt_idx"
ON "Enquiry"("customerId", "createdAt");

CREATE INDEX "TestDriveRequest_customerId_createdAt_idx"
ON "TestDriveRequest"("customerId", "createdAt");

CREATE INDEX "SourcingRequest_customerId_createdAt_idx"
ON "SourcingRequest"("customerId", "createdAt");

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TestDriveRequest"
ADD CONSTRAINT "TestDriveRequest_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SourcingRequest"
ADD CONSTRAINT "SourcingRequest_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
