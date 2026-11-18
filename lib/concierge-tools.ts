import "server-only";

import { tool } from "ai";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const currencies = ["NGN", "USD", "GBP", "EUR"] as const;

const searchSchema = z.object({
  query: z.string().trim().max(100).optional().describe("Free-text make, model, trim or body-type search."),
  make: z.string().trim().max(60).optional(),
  model: z.string().trim().max(80).optional(),
  bodyType: z.string().trim().max(40).optional(),
  minYear: z.number().int().min(1900).max(2100).optional(),
  maxYear: z.number().int().min(1900).max(2100).optional(),
  maxMileage: z.number().int().min(0).max(2_000_000).optional(),
  minSeats: z.number().int().min(1).max(15).optional(),
  fuelType: z.string().trim().max(30).optional(),
  transmission: z.string().trim().max(30).optional(),
  condition: z.string().trim().max(60).optional(),
  maxBudget: z.number().positive().max(999_999_999_999).optional(),
  currency: z.enum(currencies).optional().describe("Required when maxBudget is supplied. Never guess a currency."),
  requiredFeatures: z.array(z.string().trim().min(1).max(80)).max(8).optional().default([]),
}).strict().superRefine((criteria, context) => {
  if (criteria.minYear !== undefined && criteria.maxYear !== undefined && criteria.minYear > criteria.maxYear) {
    context.addIssue({ code: "custom", path: ["maxYear"], message: "maxYear cannot be earlier than minYear." });
  }
  if (criteria.maxBudget !== undefined && criteria.currency === undefined) {
    context.addIssue({ code: "custom", path: ["currency"], message: "A currency is required to filter a budget." });
  }
});

const publicVehicleSelect = {
  id: true,
  slug: true,
  make: true,
  model: true,
  trim: true,
  year: true,
  bodyType: true,
  description: true,
  price: true,
  currency: true,
  condition: true,
  mileage: true,
  transmission: true,
  fuelType: true,
  engine: true,
  drivetrain: true,
  seats: true,
  exteriorColour: true,
  interiorColour: true,
  features: true,
  status: true,
  isDemo: true,
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
    select: { url: true, altText: true },
  },
} satisfies Prisma.VehicleSelect;

function formatVehicle(row: {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  bodyType: string;
  description: string;
  price: { toNumber(): number } | null;
  currency: string;
  condition: string;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  engine: string | null;
  drivetrain: string | null;
  seats: number | null;
  exteriorColour: string | null;
  interiorColour: string | null;
  features: string[];
  status: string;
  isDemo: boolean;
  images: { url: string; altText: string | null }[];
}) {
  return {
    id: row.id,
    slug: row.slug,
    make: row.make,
    model: row.model,
    trim: row.trim,
    year: row.year,
    bodyType: row.bodyType,
    description: row.description,
    price: row.price?.toNumber() ?? null,
    currency: row.currency,
    condition: row.condition,
    mileage: row.mileage,
    transmission: row.transmission,
    fuelType: row.fuelType,
    engine: row.engine,
    drivetrain: row.drivetrain,
    seats: row.seats,
    exteriorColour: row.exteriorColour,
    interiorColour: row.interiorColour,
    features: row.features,
    status: row.status,
    isDemo: row.isDemo,
    image: row.images[0]?.url ?? null,
    imageAlt: row.images[0]?.altText ?? (row.make + " " + row.model),
  };
}

function matchReasons(
  vehicle: ReturnType<typeof formatVehicle>,
  criteria: z.infer<typeof searchSchema>,
) {
  const reasons: string[] = [];
  if (criteria.make && vehicle.make.toLowerCase() === criteria.make.toLowerCase()) reasons.push("Matches the requested make.");
  if (criteria.model && vehicle.model.toLowerCase().includes(criteria.model.toLowerCase())) reasons.push("Matches the requested model.");
  if (criteria.bodyType && vehicle.bodyType.toLowerCase() === criteria.bodyType.toLowerCase()) reasons.push("Matches the requested body type.");
  if (criteria.minYear !== undefined && vehicle.year >= criteria.minYear) reasons.push("Meets the minimum year.");
  if (criteria.maxYear !== undefined && vehicle.year <= criteria.maxYear) reasons.push("Meets the maximum year.");
  if (criteria.maxMileage !== undefined && vehicle.mileage !== null && vehicle.mileage <= criteria.maxMileage) reasons.push("Meets the mileage limit.");
  if (criteria.minSeats !== undefined && vehicle.seats !== null && vehicle.seats >= criteria.minSeats) reasons.push("Meets the seating requirement.");
  if (criteria.fuelType && vehicle.fuelType?.toLowerCase() === criteria.fuelType.toLowerCase()) reasons.push("Matches the preferred fuel type.");
  if (criteria.transmission && vehicle.transmission?.toLowerCase() === criteria.transmission.toLowerCase()) reasons.push("Matches the preferred transmission.");
  if (criteria.condition && vehicle.condition.toLowerCase().includes(criteria.condition.toLowerCase())) reasons.push("Matches the requested condition.");
  if (criteria.maxBudget !== undefined && vehicle.price !== null && vehicle.currency === criteria.currency && vehicle.price <= criteria.maxBudget) reasons.push("Within the stated budget and currency.");
  if (criteria.requiredFeatures?.length) {
    const matched = criteria.requiredFeatures.filter((feature) =>
      vehicle.features.some((stored) => stored.toLowerCase() === feature.toLowerCase()),
    );
    if (matched.length) reasons.push("Recorded features include: " + matched.join(", ") + ".");
  }
  return reasons;
}

export function createConciergeTools() {
  return {
    searchVehicles: tool({
      description:
        "Search current published Ritewheel vehicle records. Use this when the customer describes requirements or asks for alternatives. Apply only preferences the customer actually stated. A budget must include its explicit currency. Returns at most three records and a database-derived total count. Demo records are explicitly marked isDemo and must never be called real available stock.",
      inputSchema: searchSchema,
      execute: async (criteria) => {
        if (!process.env.DATABASE_URL) {
          return {
            source: "not_connected" as const,
            totalMatched: 0,
            liveMatchCount: 0,
            demoMatchCount: 0,
            items: [],
            message: "The dealership inventory database is not connected in this environment. Do not invent or substitute demo stock.",
          };
        }

        try {
          const where = {
            status: "AVAILABLE" as const,
            publishedAt: { not: null },
            ...(criteria.query ? {
              OR: [
                { make: { contains: criteria.query, mode: "insensitive" as const } },
                { model: { contains: criteria.query, mode: "insensitive" as const } },
                { trim: { contains: criteria.query, mode: "insensitive" as const } },
                { bodyType: { contains: criteria.query, mode: "insensitive" as const } },
              ],
            } : {}),
            ...(criteria.make ? { make: { equals: criteria.make, mode: "insensitive" as const } } : {}),
            ...(criteria.model ? { model: { contains: criteria.model, mode: "insensitive" as const } } : {}),
            ...(criteria.bodyType ? { bodyType: { equals: criteria.bodyType, mode: "insensitive" as const } } : {}),
            ...(criteria.minYear !== undefined || criteria.maxYear !== undefined
              ? { year: { ...(criteria.minYear !== undefined ? { gte: criteria.minYear } : {}), ...(criteria.maxYear !== undefined ? { lte: criteria.maxYear } : {}) } }
              : {}),
            ...(criteria.maxMileage !== undefined ? { mileage: { lte: criteria.maxMileage } } : {}),
            ...(criteria.minSeats !== undefined ? { seats: { gte: criteria.minSeats } } : {}),
            ...(criteria.fuelType ? { fuelType: { equals: criteria.fuelType, mode: "insensitive" as const } } : {}),
            ...(criteria.transmission ? { transmission: { equals: criteria.transmission, mode: "insensitive" as const } } : {}),
            ...(criteria.condition ? { condition: { contains: criteria.condition, mode: "insensitive" as const } } : {}),
            ...(criteria.maxBudget !== undefined && criteria.currency
              ? { price: { lte: criteria.maxBudget }, currency: criteria.currency }
              : {}),
            ...(criteria.requiredFeatures?.length ? { features: { hasEvery: criteria.requiredFeatures } } : {}),
          };

          const prisma = getPrismaClient();
          const [rows, totalMatched] = await Promise.all([
            prisma.vehicle.findMany({
              where,
              orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
              take: 3,
              select: publicVehicleSelect,
            }),
            prisma.vehicle.count({ where }),
          ]);

          const items = rows.map((row) => {
            const vehicle = formatVehicle(row);
            return { ...vehicle, matchReasons: matchReasons(vehicle, criteria) };
          });

          return {
            source: "database" as const,
            totalMatched,
            liveMatchCount: items.filter((item) => !item.isDemo).length,
            demoMatchCount: items.filter((item) => item.isDemo).length,
            items,
            appliedCriteria: criteria,
          };
        } catch (error) {
          console.error("Concierge inventory search failed:", error instanceof Error ? error.message : "Unknown error");
          return {
            source: "error" as const,
            totalMatched: 0,
            liveMatchCount: 0,
            demoMatchCount: 0,
            items: [],
            message: "Inventory could not be queried. Ask the customer to retry; do not guess results.",
          };
        }
      },
    }),

    getVehicleDetails: tool({
      description:
        "Retrieve recorded public facts for a specific vehicle ID returned by an inventory tool. Use it to answer detailed vehicle questions. Do not infer missing specifications or history.",
      inputSchema: z.object({ vehicleId: z.string().min(1).max(40) }).strict(),
      execute: async ({ vehicleId }) => {
        if (!process.env.DATABASE_URL) return { found: false as const, source: "not_connected" as const };
        try {
          const row = await getPrismaClient().vehicle.findFirst({
            where: {
              id: vehicleId,
              publishedAt: { not: null },
              status: { in: ["AVAILABLE", "RESERVED", "SOLD"] },
            },
            select: publicVehicleSelect,
          });
          return row
            ? { found: true as const, source: "database" as const, vehicle: formatVehicle(row) }
            : { found: false as const, source: "database" as const };
        } catch (error) {
          console.error("Concierge vehicle detail lookup failed:", error instanceof Error ? error.message : "Unknown error");
          return { found: false as const, source: "error" as const };
        }
      },
    }),

    compareVehicles: tool({
      description:
        "Compare two or three actual published Ritewheel vehicle records by their IDs. Never convert currencies. Call this only when the customer asks for a comparison or needs help choosing between specific listings.",
      inputSchema: z.object({
        vehicleIds: z.array(z.string().min(1).max(40)).min(2).max(3),
      }).strict().superRefine((value, context) => {
        if (new Set(value.vehicleIds).size !== value.vehicleIds.length) {
          context.addIssue({ code: "custom", path: ["vehicleIds"], message: "Vehicle IDs must be unique." });
        }
      }),
      execute: async ({ vehicleIds }) => {
        if (!process.env.DATABASE_URL) return { source: "not_connected" as const, items: [], missingIds: vehicleIds };
        try {
          const rows = await getPrismaClient().vehicle.findMany({
            where: {
              id: { in: vehicleIds },
              publishedAt: { not: null },
              status: { in: ["AVAILABLE", "RESERVED", "SOLD"] },
            },
            select: publicVehicleSelect,
          });
          const byId = new Map(rows.map((row) => [row.id, formatVehicle(row)]));
          const items = vehicleIds.map((id) => byId.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
          const currenciesInResult = [...new Set(items.map((item) => item.currency))];
          return {
            source: "database" as const,
            items,
            missingIds: vehicleIds.filter((id) => !byId.has(id)),
            pricesComparable: items.length === vehicleIds.length && currenciesInResult.length === 1 && items.every((item) => item.price !== null),
            currency: currenciesInResult.length === 1 ? currenciesInResult[0] : null,
          };
        } catch (error) {
          console.error("Concierge vehicle comparison failed:", error instanceof Error ? error.message : "Unknown error");
          return { source: "error" as const, items: [], missingIds: vehicleIds, pricesComparable: false, currency: null };
        }
      },
    }),

    getVehicleOptions: tool({
      description:
        "Retrieve valid Design Studio choices and exact preview-asset mappings for a published vehicle. Return only options currently marked available. If there are none, say the vehicle has no supported Design Studio configuration. Never invent options, preview assets or price adjustments.",
      inputSchema: z.object({ vehicleId: z.string().min(1).max(40) }).strict(),
      execute: async ({ vehicleId }) => {
        if (!process.env.DATABASE_URL) return { found: false as const, source: "not_connected" as const, groups: [] };
        try {
          const vehicle = await getPrismaClient().vehicle.findFirst({
            where: {
              id: vehicleId,
              publishedAt: { not: null },
              status: { in: ["AVAILABLE", "RESERVED", "SOLD"] },
            },
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              currency: true,
              options: {
                where: { available: true },
                orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }],
                select: { id: true, groupKey: true, optionKey: true, label: true, priceDelta: true, previewImageUrl: true },
              },
            },
          });
          if (!vehicle) return { found: false as const, source: "database" as const, groups: [] };

          const grouped = new Map<string, Array<{
            id: string;
            optionKey: string;
            label: string;
            priceDelta: number | null;
            currency: string;
            previewImageUrl: string | null;
          }>>();
          for (const option of vehicle.options) {
            const options = grouped.get(option.groupKey) ?? [];
            options.push({
              id: option.id,
              optionKey: option.optionKey,
              label: option.label,
              priceDelta: option.priceDelta?.toNumber() ?? null,
              currency: vehicle.currency,
              previewImageUrl: option.previewImageUrl,
            });
            grouped.set(option.groupKey, options);
          }

          return {
            found: true as const,
            source: "database" as const,
            vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year },
            groups: [...grouped.entries()].map(([groupKey, options]) => ({ groupKey, options })),
          };
        } catch (error) {
          console.error("Concierge vehicle options lookup failed:", error instanceof Error ? error.message : "Unknown error");
          return { found: false as const, source: "error" as const, groups: [] };
        }
      },
    }),
  };
}
