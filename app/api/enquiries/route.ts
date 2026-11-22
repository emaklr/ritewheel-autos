import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 6_000;

const enquirySchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  message: z.string().trim().max(2_000).optional().default(""),
  vehicleSlug: z.string()
    .trim()
    .max(100)
    .refine((value) => value === "" || /^[a-z0-9-]{3,100}$/.test(value), "Invalid vehicle reference")
    .optional()
    .default(""),
  website: z.string().max(200).optional().default(""),
});

function badRequest(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the details and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Quietly accept honeypot submissions without storing a customer record.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, reference: "REQUEST-RECEIVED" }, { status: 202 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  const limit = await checkRateLimit(`enquiry:${clientIp}`, 5, 10 * 60 * 1000);

  if (limit.unavailable) {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a little before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!process.env.DATABASE_URL) {
    return badRequest("Enquiry submission is not connected yet. The dealership database must be configured before requests can be stored.", 503);
  }

  try {
    const prisma = getPrismaClient();
    let vehicleId: string | undefined;

    if (parsed.data.vehicleSlug) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          slug: parsed.data.vehicleSlug,
          publishedAt: { not: null },
          isDemo: false,
          status: { in: ["AVAILABLE", "RESERVED", "SOLD"] },
        },
        select: { id: true },
      });

      if (!vehicle) {
        return badRequest("This vehicle listing is not accepting enquiries. Please refresh and try another listing.", 404);
      }
      vehicleId = vehicle.id;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message || null,
        vehicleId,
        source: vehicleId ? "VEHICLE_DETAIL" : "CONTACT_PAGE",
      },
      select: { reference: true },
    });

    return NextResponse.json({ ok: true, reference: enquiry.reference }, { status: 201 });
  } catch (error) {
    console.error("Enquiry creation failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("We could not save your enquiry. Please try again.", 500);
  }
}
