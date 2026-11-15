import { getPrismaClient } from "@/lib/db";

export type VehicleSummary = {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  bodyType: string;
  condition: string;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  engine: string | null;
  seats: number | null;
  price: number | null;
  currency: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "DRAFT" | "ARCHIVED";
  featured: boolean;
  isDemo: boolean;
  description: string;
  image: string;
  imageAlt: string;
};

const demoVehicles: VehicleSummary[] = [
  {
    id: "demo-gle-450",
    slug: "mercedes-benz-gle-450-2024-demo",
    make: "Mercedes-Benz",
    model: "GLE 450",
    trim: "4MATIC",
    year: 2024,
    bodyType: "SUV",
    condition: "Foreign Used",
    mileage: 12400,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Inline-6 Turbo",
    seats: 5,
    price: 95000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: true,
    isDemo: true,
    description: "An illustrative premium SUV listing used to demonstrate Ritewheel's discovery experience.",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Luxury Mercedes-Benz vehicle in a studio setting",
  },
  {
    id: "demo-bmw-x5",
    slug: "bmw-x5-xdrive40i-2023-demo",
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    year: 2023,
    bodyType: "SUV",
    condition: "Foreign Used",
    mileage: 16800,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Turbo Inline-6",
    seats: 5,
    price: 110000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: true,
    isDemo: true,
    description: "An illustrative BMW SUV record for the first Ritewheel catalogue prototype.",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Dark premium BMW SUV",
  },
  {
    id: "demo-prado",
    slug: "toyota-land-cruiser-prado-2024-demo",
    make: "Toyota",
    model: "Land Cruiser Prado",
    trim: "VX",
    year: 2024,
    bodyType: "SUV",
    condition: "Brand New",
    mileage: 0,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "2.4L Turbo",
    seats: 7,
    price: 125000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: true,
    isDemo: true,
    description: "An illustrative seven-seat SUV record. Specifications and price are sample data only.",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Premium silver sport utility vehicle",
  },
];

export type VehicleFilters = {
  q?: string;
  make?: string;
  bodyType?: string;
  maxBudget?: number;
  sort?: "newest" | "price-low" | "price-high";
  page?: number;
  pageSize?: number;
};

function filterDemoVehicles(filters: VehicleFilters) {
  let results = demoVehicles.filter((vehicle) => vehicle.status === "AVAILABLE");

  if (filters.q) {
    const query = filters.q.toLowerCase();
    results = results.filter((vehicle) =>
      [vehicle.make, vehicle.model, vehicle.trim, vehicle.bodyType]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }

  if (filters.make) {
    results = results.filter((vehicle) => vehicle.make.toLowerCase() === filters.make?.toLowerCase());
  }

  if (filters.bodyType) {
    results = results.filter((vehicle) => vehicle.bodyType.toLowerCase() === filters.bodyType?.toLowerCase());
  }

  if (filters.maxBudget) {
    results = results.filter((vehicle) => vehicle.price !== null && vehicle.price <= filters.maxBudget!);
  }

  if (filters.sort === "price-low") results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (filters.sort === "price-high") results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (filters.sort === "newest") results.sort((a, b) => b.year - a.year);

  return results;
}

function formatVehicle(row: {
  id: string;
  slug: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  bodyType: string;
  condition: string;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  engine: string | null;
  seats: number | null;
  price: { toNumber(): number } | null;
  currency: string;
  status: VehicleSummary["status"];
  featured: boolean;
  isDemo: boolean;
  description: string;
  images: { url: string; altText: string | null }[];
}): VehicleSummary {
  return {
    ...row,
    price: row.price?.toNumber() ?? null,
    image: row.images[0]?.url ?? "/images/vehicle-placeholder.svg",
    imageAlt: row.images[0]?.altText ?? `${row.make} ${row.model}`,
  };
}

export async function getFeaturedVehicles(): Promise<VehicleSummary[]> {
  if (!process.env.DATABASE_URL) {
    return demoVehicles.filter((vehicle) => vehicle.featured).slice(0, 3);
  }

  const prisma = getPrismaClient();
  const rows = await prisma.vehicle.findMany({
    where: { status: "AVAILABLE", publishedAt: { not: null }, featured: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      id: true, slug: true, make: true, model: true, trim: true, year: true,
      bodyType: true, condition: true, mileage: true, transmission: true,
      fuelType: true, engine: true, seats: true, price: true, currency: true,
      status: true, featured: true, isDemo: true, description: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true, altText: true } },
    },
  });

  return rows.map(formatVehicle);
}

export async function searchVehicles(filters: VehicleFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 12));

  if (!process.env.DATABASE_URL) {
    const all = filterDemoVehicles(filters);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      page,
      pageSize,
      total: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
      dataSource: "demo" as const,
    };
  }

  const prisma = getPrismaClient();
  const where = {
    status: "AVAILABLE" as const,
    publishedAt: { not: null },
    ...(filters.q ? {
      OR: [
        { make: { contains: filters.q, mode: "insensitive" as const } },
        { model: { contains: filters.q, mode: "insensitive" as const } },
        { trim: { contains: filters.q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(filters.make ? { make: { equals: filters.make, mode: "insensitive" as const } } : {}),
    ...(filters.bodyType ? { bodyType: { equals: filters.bodyType, mode: "insensitive" as const } } : {}),
    ...(filters.maxBudget ? { price: { lte: filters.maxBudget } } : {}),
  };

  const orderBy = filters.sort === "price-low"
    ? [{ price: "asc" as const }]
    : filters.sort === "price-high"
      ? [{ price: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [rows, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, slug: true, make: true, model: true, trim: true, year: true,
        bodyType: true, condition: true, mileage: true, transmission: true,
        fuelType: true, engine: true, seats: true, price: true, currency: true,
        status: true, featured: true, isDemo: true, description: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true, altText: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    items: rows.map(formatVehicle),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    dataSource: "database" as const,
  };
}

export async function getVehicleBySlug(slug: string): Promise<VehicleSummary | null> {
  if (!process.env.DATABASE_URL) {
    return demoVehicles.find((vehicle) => vehicle.slug === slug) ?? null;
  }

  const prisma = getPrismaClient();
  const row = await prisma.vehicle.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, make: true, model: true, trim: true, year: true,
      bodyType: true, condition: true, mileage: true, transmission: true,
      fuelType: true, engine: true, seats: true, price: true, currency: true,
      status: true, featured: true, isDemo: true, description: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { url: true, altText: true } },
    },
  });

  if (!row || row.status === "DRAFT" || row.status === "ARCHIVED") return null;
  return formatVehicle(row);
}
