import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 6_000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const testDriveSchema = z.object({
  vehicleSlug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/),
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  preferredDate: z.string().regex(datePattern, "Choose a valid preferred date.").refine(isValidDateOnly, "Choose a real calendar date."),
  preferredTime: z.string().regex(timePattern, "Choose a valid preferred time."),
  notes: z.string().trim().max(1_200).optional().default(""),
  website: z.string().max(200).optional().default(""),
}).strict();

function badRequest(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isValidDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function nigeriaNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function isFutureLocalSlot(date: string, time: string) {
  const now = nigeriaNow();
  return date > now.date || (date === now.date && time > now.time);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return badRequest("This request origin is not allowed.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return badRequest("The request is too large.", 413);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_LENGTH) {
    return badRequest("The request is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return badRequest("A valid JSON request body is required.", 400);
  }

  const parsed = testDriveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the details and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, reference: "REQUEST-RECEIVED" }, { status: 202 });
  }

  if (!isFutureLocalSlot(parsed.data.preferredDate, parsed.data.preferredTime)) {
    return badRequest("Choose a future date and time in West Africa Time (WAT).", 400);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  const limit = checkRateLimit(`test-drive:${clientIp}`, 4, 15 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many test-drive requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!process.env.DATABASE_URL) {
    return badRequest("Test-drive requests are not connected yet. Please contact the dealership.", 503);
  }

  try {
    const prisma = getPrismaClient();
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        slug: parsed.data.vehicleSlug,
        publishedAt: { not: null },
        isDemo: false,
        status: "AVAILABLE",
      },
      select: { id: true },
    });

    if (!vehicle) {
      return badRequest("This vehicle is no longer accepting test-drive requests. Please refresh the listing or contact the dealership.", 404);
    }

    const created = await prisma.testDriveRequest.create({
      data: {
        vehicleId: vehicle.id,
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        preferredDate: new Date(`${parsed.data.preferredDate}T00:00:00.000Z`),
        preferredTime: parsed.data.preferredTime,
        notes: parsed.data.notes || null,
      },
      select: { reference: true },
    });

    return NextResponse.json(
      { ok: true, reference: created.reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Test-drive request creation failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("We could not save your test-drive request. Please try again.", 500);
  }
}
