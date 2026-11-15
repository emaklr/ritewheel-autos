import { z } from "zod";

const currencies = ["NGN", "USD", "GBP", "EUR", "AED", "ZAR", "CAD", "AUD"] as const;

function isSafeImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("..")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const nullableText = (max: number) => z.string().trim().max(max).nullable();

export const adminVehicleInputSchema = z.object({
  slug: z.string().trim().max(120).optional().default(""),
  make: z.string().trim().min(2).max(60),
  model: z.string().trim().min(1).max(80),
  trim: nullableText(80),
  year: z.number().int().min(1886).max(2100),
  bodyType: z.string().trim().min(2).max(40),
  description: z.string().trim().min(10).max(4_000),
  price: z.string().regex(/^\d{1,14}(\.\d{1,2})?$/, "Enter a valid price or leave it blank.").nullable(),
  currency: z.enum(currencies),
  condition: z.string().trim().min(2).max(60),
  mileage: z.number().int().min(0).max(2_000_000).nullable(),
  transmission: nullableText(60),
  fuelType: nullableText(60),
  engine: nullableText(100),
  drivetrain: nullableText(60),
  seats: z.number().int().min(1).max(20).nullable(),
  exteriorColour: nullableText(60),
  interiorColour: nullableText(60),
  features: z.array(z.string().trim().min(1).max(60)).max(50),
  images: z.array(z.object({
    url: z.string().trim().min(1).max(2_048).refine(isSafeImageUrl, "Use a valid HTTP(S) image URL or a safe site-local path."),
    altText: z.string().trim().max(200).nullable().optional(),
    sortOrder: z.number().int().min(0).max(100),
    isPrimary: z.boolean(),
  })).max(12),
  status: z.enum(["DRAFT", "AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"]),
  featured: z.boolean(),
  isDemo: z.boolean(),
}).superRefine((value, context) => {
  if (value.status === "AVAILABLE" && value.images.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["images"],
      message: "Add at least one image before publishing an available listing.",
    });
  }
});

export type AdminVehicleInput = z.infer<typeof adminVehicleInputSchema>;

export function createVehicleSlug(input: AdminVehicleInput) {
  const source = input.slug || `${input.make}-${input.model}-${input.year}`;
  return source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function vehiclePublishedAt(
  status: AdminVehicleInput["status"],
  existingPublishedAt?: Date | null,
) {
  if (status === "DRAFT") return null;
  if (status === "ARCHIVED") return existingPublishedAt ?? null;
  return existingPublishedAt ?? new Date();
}

export function vehicleScalarData(input: AdminVehicleInput, publishedAt: Date | null) {
  return {
    slug: createVehicleSlug(input),
    make: input.make,
    model: input.model,
    trim: input.trim,
    year: input.year,
    bodyType: input.bodyType,
    description: input.description,
    price: input.price,
    currency: input.currency,
    condition: input.condition,
    mileage: input.mileage,
    transmission: input.transmission,
    fuelType: input.fuelType,
    engine: input.engine,
    drivetrain: input.drivetrain,
    seats: input.seats,
    exteriorColour: input.exteriorColour,
    interiorColour: input.interiorColour,
    features: input.features,
    status: input.status,
    featured: input.featured,
    isDemo: input.isDemo,
    publishedAt,
  };
}
