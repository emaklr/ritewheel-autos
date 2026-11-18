import "server-only";

import { cache } from "react";
import { getPrismaClient } from "@/lib/db";

export type PublicDealershipSettings = {
  displayName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  whatsappNumber: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  openingHours: string | null;
};

const defaultSettings: PublicDealershipSettings = {
  displayName: "Ritewheel Autos",
  contactPhone: null,
  contactEmail: null,
  whatsappNumber: null,
  addressLine: null,
  city: null,
  state: null,
  country: null,
  openingHours: null,
};

export const getPublicDealershipSettings = cache(async (): Promise<PublicDealershipSettings> => {
  if (!process.env.DATABASE_URL) return defaultSettings;

  try {
    const settings = await getPrismaClient().dealershipSetting.findUnique({
      where: { id: "default" },
      select: {
        displayName: true,
        contactPhone: true,
        contactEmail: true,
        whatsappNumber: true,
        addressLine: true,
        city: true,
        state: true,
        country: true,
        openingHours: true,
      },
    });
    return settings ? { ...defaultSettings, ...settings } : defaultSettings;
  } catch (error) {
    console.error("Public dealership settings could not be loaded:", error instanceof Error ? error.message : "Unknown error");
    return defaultSettings;
  }
});
