-- CreateTable
CREATE TABLE "DealershipSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "displayName" TEXT NOT NULL DEFAULT 'Ritewheel Autos',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "whatsappNumber" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "openingHours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DealershipSetting_pkey" PRIMARY KEY ("id")
);
