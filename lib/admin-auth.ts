import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const ADMIN_COOKIE = "ritewheel_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(adminUserId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const prisma = getPrismaClient();

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    },
  });

  return token;
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(response: NextResponse): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    await getPrismaClient().adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;

  const session = await getPrismaClient().adminSession.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      expiresAt: { gt: new Date() },
      adminUser: { active: true },
    },
    select: {
      adminUser: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  return session?.adminUser ?? null;
}

export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireAdminApi() {
  return getCurrentAdmin();
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
