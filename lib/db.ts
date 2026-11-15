import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const connectionString = process.env.DATABASE_URL;

function createPrismaClient(): PrismaClient | null {
  if (!connectionString) return null;
  const adapter = new PrismaPg({ connectionString });
  return globalForPrisma.prisma ?? new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();
export const databaseConfigured = Boolean(connectionString);

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}