import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 5_000;

const purchaseIntentSchema = z.object({
  vehicleSlug: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/),
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  message: z.string().trim().max(1_500).optional().default(""),
  website: z.string().max(200).optional().default(""),
}).strict();

function badRequest(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function formatIndicativePrice(price: { toString(): string } | null, currency: string) {
  if (price === null) return "Price on request";
  const amount = Number(price.toString());
  if (!Number.isFinite(amount)) return `${price.toString()} ${currency}`;

  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  }
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

  const parsed = purchaseIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the details and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Silently accept honeypot submissions without storing a customer record.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, reference: "REQUEST-RECEIVED" }, { status: 202 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  const limit = await checkRateLimit(`purchase-intent:${clientIp}`, 4, 15 * 60 * 1000);

  if (limit.unavailable) {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many purchase-interest requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!process.env.DATABASE_URL) {
    return badRequest("Purchase-interest requests are not connected yet. Please contact the dealership.", 503);
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
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        price: true,
        currency: true,
      },
    });

    if (!vehicle) {
      return badRequest(
        "This vehicle is no longer accepting purchase-interest requests. Please refresh the listing or contact the dealership.",
        404,
      );
    }

    const message = [
      parsed.data.message ? `Customer note: ${parsed.data.message}` : null,
      "Purchase-interest snapshot",
      `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      `Indicative listed price at submission: ${formatIndicativePrice(vehicle.price, vehicle.currency)}`,
      "This request does not reserve the vehicle or lock its price. Availability, condition, documents, final costs and terms must be confirmed by the dealership.",
    ].filter(Boolean).join("\n\n");

    const created = await prisma.enquiry.create({
      data: {
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message,
        source: "PURCHASE_INTENT",
        vehicleId: vehicle.id,
      },
      select: { reference: true },
    });

    return NextResponse.json(
      { ok: true, reference: created.reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Purchase-interest request creation failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("We could not save your purchase-interest request. Please try again.", 500);
  }
}
