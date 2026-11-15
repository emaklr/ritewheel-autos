import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, isSameOriginRequest, setAdminSessionCookie } from "@/lib/admin-auth";
import { verifyAdminPassword, hashAdminPassword } from "@/lib/admin-password";
import { getPrismaClient } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 2_000;
const loginSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "A valid sign-in request is required." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 400 });
  }

  const clientIp = request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const limit = checkRateLimit(`admin-login:${clientIp}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const prisma = getPrismaClient();
    const admin = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true, active: true },
    });

    // Perform a comparable password-hash operation for unknown emails to reduce timing-based account discovery.
    const passwordMatches = admin
      ? await verifyAdminPassword(parsed.data.password, admin.passwordHash)
      : (await hashAdminPassword("Ritewheel invalid account timing check")).length > 0;

    if (!admin || !admin.active || !passwordMatches) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const token = await createAdminSession(admin.id);
    const response = NextResponse.json({ ok: true, redirectTo: "/admin" });
    setAdminSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
