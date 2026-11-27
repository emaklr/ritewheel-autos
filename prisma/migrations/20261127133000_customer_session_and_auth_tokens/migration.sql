-- Add opaque customer sessions and purpose-bound single-use auth tokens.
-- No authentication endpoints are enabled by this migration.

CREATE TYPE "CustomerAuthTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

CREATE TABLE "CustomerSession" (
    "id" TEXT NOT NULL,
    "customerAccountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "absoluteExpiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerAuthToken" (
    "id" TEXT NOT NULL,
    "customerAccountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" "CustomerAuthTokenPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerAuthToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerSession_tokenHash_key" ON "CustomerSession"("tokenHash");
CREATE INDEX "CustomerSession_customerAccountId_expiresAt_idx" ON "CustomerSession"("customerAccountId", "expiresAt");
CREATE INDEX "CustomerSession_expiresAt_idx" ON "CustomerSession"("expiresAt");
CREATE INDEX "CustomerSession_absoluteExpiresAt_idx" ON "CustomerSession"("absoluteExpiresAt");

CREATE UNIQUE INDEX "CustomerAuthToken_tokenHash_key" ON "CustomerAuthToken"("tokenHash");
CREATE INDEX "CustomerAuthToken_customerAccountId_purpose_expiresAt_idx" ON "CustomerAuthToken"("customerAccountId", "purpose", "expiresAt");
CREATE INDEX "CustomerAuthToken_expiresAt_idx" ON "CustomerAuthToken"("expiresAt");

ALTER TABLE "CustomerSession"
ADD CONSTRAINT "CustomerSession_customerAccountId_fkey"
FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerAuthToken"
ADD CONSTRAINT "CustomerAuthToken_customerAccountId_fkey"
FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
