import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the Ritewheel database.");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const vehicles = [
  {
    slug: "demo-mercedes-gle", make: "Mercedes-Benz", model: "GLE 63 S", trim: "AMG",
    year: 2021, bodyType: "SUV",
    description: "Illustrative demo listing used to demonstrate the Ritewheel marketplace. Replace this record with verified vehicle details before presenting it as real stock.",
    currency: "NGN", condition: "Used", status: "AVAILABLE" as const, featured: true, isDemo: true, publishedAt: new Date(),
    images: [{ url: "/images/vehicles/mercedes-gle.webp", altText: "Blue Mercedes-Benz GLE demonstration vehicle", sortOrder: 0, isPrimary: true }]
  },
  {
    slug: "demo-bmw-x6", make: "BMW", model: "X6 M", trim: "M",
    year: 2020, bodyType: "SUV",
    description: "Illustrative demo listing used to demonstrate search, vehicle details and comparison. Specifications and availability must be replaced with verified listing data.",
    currency: "NGN", condition: "Used", status: "AVAILABLE" as const, featured: true, isDemo: true, publishedAt: new Date(),
    images: [{ url: "/images/vehicles/bmw-x6.webp", altText: "Blue BMW X6 M demonstration vehicle", sortOrder: 0, isPrimary: true }]
  },
  {
    slug: "demo-range-rover-sport", make: "Land Rover", model: "Range Rover Sport",
    year: 2022, bodyType: "SUV",
    description: "Illustrative demo listing used to demonstrate vehicle discovery. Replace the example details with verified vehicle information before treating this as an available offer.",
    currency: "NGN", condition: "Used", status: "AVAILABLE" as const, featured: true, isDemo: true, publishedAt: new Date(),
    images: [{ url: "/images/vehicles/range-rover-sport.webp", altText: "Red Range Rover Sport demonstration vehicle", sortOrder: 0, isPrimary: true }]
  }
];

async function main() {
  for (const vehicle of vehicles) {
    const { images, ...data } = vehicle;
    await prisma.vehicle.upsert({
      where: { slug: vehicle.slug },
      update: { ...data, images: { deleteMany: {}, create: images } },
      create: { ...data, images: { create: images } }
    });
  }
  console.log("Seeded " + vehicles.length + " explicitly labelled demo vehicles.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });