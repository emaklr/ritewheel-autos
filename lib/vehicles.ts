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
  images?: { url: string; altText: string }[];
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
    image: "/images/vehicles/mercedes-gle.webp",
    imageAlt: "Blue Mercedes-Benz GLE demonstration vehicle",
    images: [{ url: "/images/vehicles/mercedes-gle.webp", altText: "Blue Mercedes-Benz GLE demonstration vehicle" }],
  },
  {
    id: "demo-bmw-x6",
    slug: "demo-bmw-x6",
    make: "BMW",
    model: "X6 M",
    trim: "M",
    year: 2020,
    bodyType: "SUV",
    condition: "Used",
    mileage: null,
    transmission: null,
    fuelType: null,
    engine: null,
    seats: null,
    price: null,
    currency: "NGN",
    status: "AVAILABLE",
    featured: false,
    isDemo: true,
    description: "Illustrative demo listing used to demonstrate search, vehicle details and comparison. Replace these example details with verified listing data before presenting it as real stock.",
    image: "/images/vehicles/bmw-x6.jpg",
    imageAlt: "Blue BMW X6 M demonstration vehicle",
    images: [{ url: "/images/vehicles/bmw-x6.jpg", altText: "Blue BMW X6 M demonstration vehicle" }],
  },
  {
    id: "demo-range-rover-sport",
    slug: "demo-range-rover-sport",
    make: "Land Rover",
    model: "Range Rover Sport",
    trim: null,
    year: 2022,
    bodyType: "SUV",
    condition: "Used",
    mileage: null,
    transmission: null,
    fuelType: null,
    engine: null,
    seats: null,
    price: null,
    currency: "NGN",
    status: "AVAILABLE",
    featured: false,
    isDemo: true,
    description: "Illustrative demo listing used to demonstrate vehicle discovery. Replace these example details with verified vehicle information before treating this as an available offer.",
    image: "/images/vehicles/range-rover-sport.webp",
    imageAlt: "Red Range Rover Sport demonstration vehicle",
    images: [{ url: "/images/vehicles/range-rover-sport.webp", altText: "Red Range Rover Sport demonstration vehicle" }],
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
  {
    id: "demo-e-class",
    slug: "mercedes-benz-e-class-e350-2023-demo",
    make: "Mercedes-Benz",
    model: "E-Class",
    trim: "E350",
    year: 2023,
    bodyType: "Sedan",
    condition: "Foreign Used",
    mileage: 14200,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "2.0L Turbo",
    seats: 5,
    price: 82000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: false,
    isDemo: true,
    description: "Illustrative executive sedan record for the Ritewheel demo catalogue.",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Premium executive sedan",
  },
  {
    id: "demo-porsche-911",
    slug: "porsche-911-carrera-2022-demo",
    make: "Porsche",
    model: "911 Carrera",
    trim: "Carrera",
    year: 2022,
    bodyType: "Coupe",
    condition: "Foreign Used",
    mileage: 9200,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Twin-Turbo Flat-6",
    seats: 4,
    price: 180000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: false,
    isDemo: true,
    description: "Illustrative sports coupe record for the Ritewheel demo catalogue.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Porsche 911 sports coupe",
  },
  {
    id: "demo-toyota-hilux",
    slug: "toyota-hilux-gr-sport-2024-demo",
    make: "Toyota",
    model: "Hilux",
    trim: "GR Sport",
    year: 2024,
    bodyType: "Pickup",
    condition: "Brand New",
    mileage: 0,
    transmission: "Automatic",
    fuelType: "Diesel",
    engine: "2.8L Turbo Diesel",
    seats: 5,
    price: 76000000,
    currency: "NGN",
    status: "AVAILABLE",
    featured: false,
    isDemo: true,
    description: "Illustrative pickup record for the Ritewheel demo catalogue.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Premium pickup truck",
  },
];

export type VehicleFilters = {
  q?: string;
  make?: string;
  bodyType?: string;
  maxBudget?: number;
  currency?: string;
  sort?: "newest" | "price-low" | "price-high";
  page?: number;
  pageSize?: number;
};

function filterDemoVehicles(filters: VehicleFilters) {
  let results = demoVehicles.filter((vehicle) => vehicle.status === "AVAILABLE");

  if (filters.currency) {
    results = results.filter((vehicle) => vehicle.currency === filters.currency);
  }

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
  const images = row.images.map((image) => ({
    url: image.url,
    altText: image.altText ?? `${row.make} ${row.model}`,
  }));

  return {
    ...row,
    price: row.price?.toNumber() ?? null,
    image: images[0]?.url ?? "/images/vehicle-placeholder.svg",
    imageAlt: images[0]?.altText ?? `${row.make} ${row.model}`,
    images,
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
    ...(filters.currency ? { currency: filters.currency } : {}),
    ...(filters.maxBudget ? { price: { lte: filters.maxBudget }, currency: filters.currency ?? "NGN" } : {}),
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


export async function getVehiclesBySlugs(slugs: string[]): Promise<{ items: VehicleSummary[]; dataSource: "demo" | "database" }> {
  const safeSlugs = [...new Set(slugs.filter((slug) => typeof slug === "string" && /^[a-z0-9-]{3,100}$/.test(slug)))].slice(0, 50);
  if (safeSlugs.length === 0) return { items: [], dataSource: process.env.DATABASE_URL ? "database" : "demo" };

  if (!process.env.DATABASE_URL) {
    const items = safeSlugs
      .map((slug) => demoVehicles.find((vehicle) => vehicle.slug === slug))
      .filter((vehicle): vehicle is VehicleSummary => Boolean(vehicle));
    return { items, dataSource: "demo" };
  }

  const prisma = getPrismaClient();
  const rows = await prisma.vehicle.findMany({
    where: { slug: { in: safeSlugs }, status: { in: ["AVAILABLE", "RESERVED", "SOLD"] } },
    select: {
      id: true, slug: true, make: true, model: true, trim: true, year: true,
      bodyType: true, condition: true, mileage: true, transmission: true,
      fuelType: true, engine: true, seats: true, price: true, currency: true,
      status: true, featured: true, isDemo: true, description: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true, altText: true } },
    },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, formatVehicle(row)]));
  return {
    items: safeSlugs.map((slug) => bySlug.get(slug)).filter((vehicle): vehicle is VehicleSummary => Boolean(vehicle)),
    dataSource: "database",
  };
}


export async function getAvailableVehicleCategories(): Promise<{ bodyType: string; count: number }[]> {
  if (!process.env.DATABASE_URL) {
    const counts = new Map<string, number>();
    for (const vehicle of demoVehicles) {
      if (vehicle.status === "AVAILABLE") counts.set(vehicle.bodyType, (counts.get(vehicle.bodyType) ?? 0) + 1);
    }
    return [...counts.entries()].map(([bodyType, count]) => ({ bodyType, count }));
  }

  const prisma = getPrismaClient();
  const rows = await prisma.vehicle.groupBy({
    by: ["bodyType"],
    where: { status: "AVAILABLE", publishedAt: { not: null } },
    _count: { _all: true },
    orderBy: { bodyType: "asc" },
  });
  return rows.map((row) => ({ bodyType: row.bodyType, count: row._count._all }));
}



export async function getAvailableVehicleMakes(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    return [...new Set(demoVehicles.filter((vehicle) => vehicle.status === "AVAILABLE").map((vehicle) => vehicle.make))].sort();
  }

  const prisma = getPrismaClient();
  const rows = await prisma.vehicle.groupBy({
    by: ["make"],
    where: { status: "AVAILABLE", publishedAt: { not: null } },
    orderBy: { make: "asc" },
  });
  return rows.map((row) => row.make);
}

export async function getAvailableVehicleCurrencies(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    return [...new Set(demoVehicles.filter((vehicle) => vehicle.status === "AVAILABLE").map((vehicle) => vehicle.currency))].sort();
  }

  const prisma = getPrismaClient();
  const rows = await prisma.vehicle.groupBy({
    by: ["currency"],
    where: { status: "AVAILABLE", publishedAt: { not: null } },
    orderBy: { currency: "asc" },
  });
  return rows.map((row) => row.currency);
}
