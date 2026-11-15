import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashAdminPassword } from "../lib/admin-password";

// Load the developer's private local environment. Explicit process variables win.
loadEnv({ path: ".env.local" });
loadEnv();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.ADMIN_NAME?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Configure it in your private .env.local file.");
}
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set a valid ADMIN_EMAIL in your local shell environment.");
}
if (!name || name.length < 2 || name.length > 100) {
  throw new Error("Set ADMIN_NAME (2–100 characters) in your local shell environment.");
}
if (!password || Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 128) {
  throw new Error("Set ADMIN_PASSWORD to a strong password between 12 and 128 bytes.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new Error("An administrator with this email already exists. No account was changed.");
  }

  const passwordHash = await hashAdminPassword(password);
  const admin = await prisma.adminUser.create({
    data: { email, name, passwordHash, role: "ADMIN", active: true },
    select: { email: true },
  });

  console.log(`Administrator account created for ${admin.email}.`);
  console.log("Sign in at /admin/login. The password was not printed or stored by this script.");
} finally {
  await prisma.$disconnect();
}
