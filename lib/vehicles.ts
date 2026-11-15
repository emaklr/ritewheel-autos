import { Prisma } from "@/generated/prisma/client";
import { prisma, databaseConfigured } from "@/lib/db";
import { demoVehicles } from "@/lib/demo-data";

export type VehicleImageSummary = { url: string; altText: string; isPrimary: boolean };

export type VehicleSummary = {
  id: string; slug: string; make: string; model: string; trim: string | null;
  year: number; bodyType: string; description: string; price: number | null; currency: string;
  condition: string | null; mileage: number | null; transmission: string | null; fuelType: string | null;
  engine: string | null; drivetrain: string | null; seats: number | null; status: string;
  featured: boolean; isDemo: boolean; imageUrl: string; images: VehicleImageSummary[];
};

export type VehicleFilters = {
  q?: string; make?: string; bodyType?: string; minPrice?: number; maxPrice?: number;
  currency?: string; sort?: "newest" | "price-asc" | "price-desc" | "year";
  page?: number; pageSize?: number;
};

export type VehiclePage = {
  items: VehicleSummary[]; page: number; pageSize: number; total: number;
  totalPages: number; isDemoMode: boolean;
};

function mapVehicle(vehicle: {
  id: string; slug: string; make: string; model: string; trim: string | null; year: number;
  bodyType: string; description: string; price: Prisma.Decimal | null; currency: string;
  condition: string | null; mileage: number | null; transmission: string | null;
  fuelType: string | null; engine: string | null; drivetrain: string | null;
  seats: number | null; status: string; featured: boolean; isDemo: boolean;
  images: { url: string; altText: string; isPrimary: boolean }[];
}): VehicleSummary {
  const images = [...vehicle.images];
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  return {
    ...vehicle,
    price: vehicle.price ? Number(vehicle.price) : null,
    imageUrl: primary?.url ?? "/images/vehicles/mercedes-gle.webp",
    images: images.map(({ url, altText, isPrimary }) => ({ url, altText, isPrimary }))
  };
}

function filterDemoVehicles(filters: VehicleFilters): VehicleSummary[] {
  let result = [...demoVehicles];
  if (filters.q) {
    const query = filters.q.toLowerCase();
    result = result.filter((vehicle) => [vehicle.make, vehicle.model, vehicle.trim ?? ""].join(" ").toLowerCase().includes(query));
  }
  if (filters.make) result = result.filter((vehicle) => vehicle.make.toLowerCase() === filters.make?.toLowerCase());
  if (filters.bodyType) result = result.filter((vehicle) => vehicle.bodyType.toLowerCase() === filters.bodyType?.toLowerCase());
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) result = result.filter((vehicle) => vehicle.price !== null);
  if (filters.sort === "year") result.sort((a, b) => b.year - a.year);
  return result;
}

export async function getVehicles(filters: VehicleFilters = {}): Promise<VehiclePage> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 12));

  if (!databaseConfigured || !prisma) {
    const filtered = filterDemoVehicles(filters);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      isDemoMode: true
    };
  }

  const where: Prisma.VehicleWhereInput = {
    publishedAt: { not: null },
    status: { in: ["AVAILABLE", "RESERVED"] }
  };
  if (filters.q) {
    where.OR = [
      { make: { contains: filters.q, mode: "insensitive" } },
      { model: { contains: filters.q, mode: "insensitive" } },
      { trim: { contains: filters.q, mode: "insensitive" } }
    ];
  }
  if (filters.make) where.make = { equals: filters.make, mode: "insensitive" };
  if (filters.bodyType) where.bodyType = { equals: filters.bodyType, mode: "insensitive" };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.currency = filters.currency ?? "NGN";
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = new Prisma.Decimal(filters.minPrice);
    if (filters.maxPrice !== undefined) where.price.lte = new Prisma.Decimal(filters.maxPrice);
  }

  const orderBy: Prisma.VehicleOrderByWithRelationInput =
    filters.sort === "price-asc" ? { price: "asc" } :
    filters.sort === "price-desc" ? { price: "desc" } :
    filters.sort === "year" ? { year: "desc" } : { publishedAt: "desc" };

  const [total, records] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where, orderBy, skip: (page - 1) * pageSize, take: pageSize,
      include: { images: { orderBy: { sortOrder: "asc" } } }
    })
  ]);

  return {
    items: records.map(mapVehicle), page, pageSize, total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)), isDemoMode: false
  };
}

export async function getFeaturedVehicles(limit = 3): Promise<{ items: VehicleSummary[]; isDemoMode: boolean }> {
  if (!databaseConfigured || !prisma) {
    return { items: demoVehicles.filter((vehicle) => vehicle.featured).slice(0, limit), isDemoMode: true };
  }
  const records = await prisma.vehicle.findMany({
    where: { featured: true, publishedAt: { not: null }, status: "AVAILABLE" },
    orderBy: { publishedAt: "desc" }, take: limit,
    include: { images: { orderBy: { sortOrder: "asc" } } }
  });
  return { items: records.map(mapVehicle), isDemoMode: false };
}

export async function getVehicleBySlug(slug: string): Promise<{ vehicle: VehicleSummary | null; isDemoMode: boolean }> {
  if (!databaseConfigured || !prisma) {
    return { vehicle: demoVehicles.find((vehicle) => vehicle.slug === slug) ?? null, isDemoMode: true };
  }
  const record = await prisma.vehicle.findFirst({
    where: { slug, publishedAt: { not: null }, status: { in: ["AVAILABLE", "RESERVED", "SOLD"] } },
    include: { images: { orderBy: { sortOrder: "asc" } } }
  });
  return { vehicle: record ? mapVehicle(record) : null, isDemoMode: false };
}

/**
 * Resolve a guest Garage/Compare collection from stable public slugs.
 * Only currently published public records are returned; order follows the
 * customer's saved selection, and sold listings remain visible as history.
 */
export async function getVehiclesBySlugs(slugs: string[]): Promise<{ items: VehicleSummary[]; isDemoMode: boolean }> {
  if (slugs.length === 0) return { items: [], isDemoMode: !databaseConfigured || !prisma };

  if (!databaseConfigured || !prisma) {
    const bySlug = new Map(demoVehicles.map((vehicle) => [vehicle.slug, vehicle]));
    return {
      items: slugs.map((slug) => bySlug.get(slug)).filter((vehicle): vehicle is VehicleSummary => Boolean(vehicle)),
      isDemoMode: true
    };
  }

  const records = await prisma.vehicle.findMany({
    where: {
      slug: { in: slugs },
      publishedAt: { not: null },
      status: { in: ["AVAILABLE", "RESERVED", "SOLD"] }
    },
    include: { images: { orderBy: { sortOrder: "asc" } } }
  });

  const bySlug = new Map(records.map((record) => [record.slug, mapVehicle(record)]));
  return {
    items: slugs.map((slug) => bySlug.get(slug)).filter((vehicle): vehicle is VehicleSummary => Boolean(vehicle)),
    isDemoMode: false
  };
}
