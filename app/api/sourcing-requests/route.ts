import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 8_000;
const currencies = ["NGN", "USD", "GBP", "EUR"] as const;
const conditions = ["No preference", "Brand new", "Used"] as const;
const mileages = ["No preference", "Under 30,000 km", "Under 60,000 km", "Under 100,000 km"] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("").transform((value) => value || null);

const sourcingRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional().default("").refine((value) => !value || value.length >= 7, "Enter a valid phone number."),
  requestedMake: optionalText(80),
  requestedModel: optionalText(80),
  requestedTrim: optionalText(100),
  minYear: z.number().int().min(1900).max(2100).nullable().optional().default(null),
  maxYear: z.number().int().min(1900).max(2100).nullable().optional().default(null),
  conditionPreference: z.enum(conditions).default("No preference"),
  budget: z.number().finite().positive().max(999_999_999_999).nullable().optional().default(null),
  currency: z.enum(currencies).default("NGN"),
  mileagePreference: z.enum(mileages).default("No preference"),
  requiredSpecifications: optionalText(2_000),
  preferredLocation: optionalText(120),
  notes: optionalText(1_500),
  website: z.string().max(200).optional().default(""),
}).strict().superRefine((data, context) => {
  if (!data.requestedMake && !data.requestedModel && !data.requiredSpecifications) {
    context.addIssue({
      code: "custom",
      path: ["requestedMake"],
      message: "Tell us at least the make, model or key specifications you want.",
    });
  }
  if (data.minYear !== null && data.maxYear !== null && data.minYear !== undefined && data.maxYear !== undefined && data.minYear > data.maxYear) {
    context.addIssue({
      code: "custom",
      path: ["maxYear"],
      message: "The latest year cannot be earlier than the earliest year.",
    });
  }
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

  const parsed = sourcingRequestSchema.safeParse(body);
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

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  const limit = await checkRateLimit("sourcing-request:" + clientIp, 4, 15 * 60 * 1000);

  if (limit.unavailable) {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many vehicle requests. Please wait before submitting another." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!process.env.DATABASE_URL) {
    return badRequest("Vehicle requests are not connected yet. Please contact the dealership.", 503);
  }

  try {
    const prisma = getPrismaClient();
    const created = await prisma.sourcingRequest.create({
      data: {
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        requestedMake: parsed.data.requestedMake,
        requestedModel: parsed.data.requestedModel,
        requestedTrim: parsed.data.requestedTrim,
        minYear: parsed.data.minYear,
        maxYear: parsed.data.maxYear,
        conditionPreference: parsed.data.conditionPreference,
        budget: parsed.data.budget === null ? null : String(parsed.data.budget),
        currency: parsed.data.budget === null ? null : parsed.data.currency,
        mileagePreference: parsed.data.mileagePreference,
        requiredSpecifications: parsed.data.requiredSpecifications,
        preferredLocation: parsed.data.preferredLocation,
        notes: parsed.data.notes,
      },
      select: { reference: true },
    });

    return NextResponse.json(
      { ok: true, reference: created.reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Vehicle sourcing request creation failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("We could not save your vehicle request. Please try again.", 500);
  }
}
