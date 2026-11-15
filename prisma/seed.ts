import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed Ritewheel demo records.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const vehicles = [
  {
    slug: "mercedes-benz-gle-450-2024-demo",
    make: "Mercedes-Benz",
    model: "GLE 450",
    trim: "4MATIC",
    year: 2024,
    bodyType: "SUV",
    description: "Illustrative premium SUV listing used to demonstrate the Ritewheel customer experience. This is demo data, not an actual vehicle offer.",
    price: "95000000",
    currency: "NGN",
    condition: "Foreign Used",
    mileage: 12400,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Inline-6 Turbo",
    drivetrain: "4MATIC AWD",
    seats: 5,
    exteriorColour: "Obsidian Black",
    interiorColour: "Black",
    features: ["Panoramic roof", "360 camera", "Leather interior", "Adaptive cruise control"],
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Luxury Mercedes-Benz vehicle in a studio setting",
  },
  {
    slug: "bmw-x5-xdrive40i-2023-demo",
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    year: 2023,
    bodyType: "SUV",
    description: "Illustrative BMW SUV record for the first Ritewheel catalogue prototype. Specifications and price are sample data only.",
    price: "110000000",
    currency: "NGN",
    condition: "Foreign Used",
    mileage: 16800,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Turbo Inline-6",
    drivetrain: "xDrive AWD",
    seats: 5,
    exteriorColour: "Black Sapphire",
    interiorColour: "Coffee",
    features: ["Panoramic roof", "Parking assistant", "Leather interior"],
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Dark premium BMW SUV",
  },
  {
    slug: "toyota-land-cruiser-prado-2024-demo",
    make: "Toyota",
    model: "Land Cruiser Prado",
    trim: "VX",
    year: 2024,
    bodyType: "SUV",
    description: "Illustrative seven-seat SUV record. Specifications and price are sample data only and are not a dealership offer.",
    price: "125000000",
    currency: "NGN",
    condition: "Brand New",
    mileage: 0,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "2.4L Turbo",
    drivetrain: "4WD",
    seats: 7,
    exteriorColour: "Silver",
    interiorColour: "Black",
    features: ["Seven seats", "Terrain select", "Adaptive cruise control"],
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Premium silver sport utility vehicle",
  },
  {
    slug: "mercedes-benz-e-class-e350-2023-demo",
    make: "Mercedes-Benz",
    model: "E-Class",
    trim: "E350",
    year: 2023,
    bodyType: "Sedan",
    description: "Illustrative executive sedan record for the Ritewheel demo catalogue.",
    price: "82000000",
    currency: "NGN",
    condition: "Foreign Used",
    mileage: 14200,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "2.0L Turbo",
    drivetrain: "Rear Wheel Drive",
    seats: 5,
    exteriorColour: "Obsidian Black",
    interiorColour: "Black",
    features: ["Leather interior", "Driver assistance"],
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Premium executive sedan",
  },
  {
    slug: "porsche-911-carrera-2022-demo",
    make: "Porsche",
    model: "911 Carrera",
    trim: "Carrera",
    year: 2022,
    bodyType: "Coupe",
    description: "Illustrative sports coupe record for the Ritewheel demo catalogue.",
    price: "180000000",
    currency: "NGN",
    condition: "Foreign Used",
    mileage: 9200,
    transmission: "Automatic",
    fuelType: "Petrol",
    engine: "3.0L Twin-Turbo Flat-6",
    drivetrain: "Rear Wheel Drive",
    seats: 4,
    exteriorColour: "Guards Red",
    interiorColour: "Black",
    features: ["Sport exhaust", "Sport chrono"],
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Porsche 911 sports coupe",
  },
  {
    slug: "toyota-hilux-gr-sport-2024-demo",
    make: "Toyota",
    model: "Hilux",
    trim: "GR Sport",
    year: 2024,
    bodyType: "Pickup",
    description: "Illustrative pickup record for the Ritewheel demo catalogue.",
    price: "76000000",
    currency: "NGN",
    condition: "Brand New",
    mileage: 0,
    transmission: "Automatic",
    fuelType: "Diesel",
    engine: "2.8L Turbo Diesel",
    drivetrain: "4WD",
    seats: 5,
    exteriorColour: "White",
    interiorColour: "Black",
    features: ["4WD", "Rear differential lock"],
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Premium pickup truck",
  },
];

async function main() {
  for (const [index, vehicle] of vehicles.entries()) {
    const { image, imageAlt, ...data } = vehicle;
    await prisma.vehicle.upsert({
      where: { slug: vehicle.slug },
      update: {},
      create: {
        ...data,
        price: vehicle.price,
        status: "AVAILABLE",
        featured: true,
        isDemo: true,
        publishedAt: new Date(),
        images: {
          create: [{
            url: image,
            altText: imageAlt,
            isPrimary: true,
            sortOrder: 0,
            imageType: "GALLERY",
          }],
        },
      },
    });
  }

  const gle = await prisma.vehicle.findUnique({
    where: { slug: "mercedes-benz-gle-450-2024-demo" },
    select: { id: true },
  });

  if (gle) {
    const options = [
      ["exteriorColour", "obsidian-black", "Obsidian Black", 0],
      ["exteriorColour", "polar-white", "Polar White", 0],
      ["exteriorColour", "selenite-grey", "Selenite Grey", 0],
      ["wheelStyle", "amg-multi-spoke", "AMG Multi-spoke", 0],
      ["interior", "black-leather", "Black Leather", 0],
      ["interior", "tan-leather", "Tan Leather", 0],
    ] as const;

    for (const [groupKey, optionKey, label, priceDelta] of options) {
      await prisma.vehicleOption.upsert({
        where: {
          vehicleId_groupKey_optionKey: { vehicleId: gle.id, groupKey, optionKey },
        },
        update: {},
        create: { vehicleId: gle.id, groupKey, optionKey, label, priceDelta },
      });
    }
  }

  console.log("Ritewheel demo inventory seeded (all records are marked as demo).");
}

main()
  .catch((error: unknown) => {
    console.error("Ritewheel seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
