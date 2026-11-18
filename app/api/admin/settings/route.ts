import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { isSameOriginRequest, requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 8_000;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("").transform((value) => value || null);

const contactPhoneSchema = z.string().trim().max(30).optional().default("")
  .refine((value) => !value || (/^[+0-9().\s-]{7,30}$/.test(value) && value.replace(/\D/g, "").length >= 7), "Enter a valid phone number.")
  .transform((value) => value || null);

const contactEmailSchema = z.string().trim().max(254).optional().default("")
  .refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email address.")
  .transform((value) => value ? value.toLowerCase() : null);

const whatsappNumberSchema = z.string().trim().max(32).optional().default("")
  .refine((value) => {
    if (!value) return true;
    const compact = value.replace(/[\s()-]/g, "");
    return /^\+[1-9]\d{7,14}$/.test(compact);
  }, "Enter WhatsApp in international format, including the + country code.")
  .transform((value) => value ? value.replace(/\D/g, "") : null);

const settingsSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  contactPhone: contactPhoneSchema,
  contactEmail: contactEmailSchema,
  whatsappNumber: whatsappNumberSchema,
  addressLine: optionalText(160),
  city: optionalText(80),
  state: optionalText(80),
  country: optionalText(80),
  openingHours: optionalText(700),
}).strict();

const selectFields = {
  id: true,
  displayName: true,
  contactPhone: true,
  contactEmail: true,
  whatsappNumber: true,
  addressLine: true,
  city: true,
  state: true,
  country: true,
  openingHours: true,
} as const;

function badRequest(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return badRequest("Administrator sign-in required.", 401);
  if (!isSameOriginRequest(request)) return badRequest("This request origin is not allowed.", 403);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return badRequest("The request is too large.", 413);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_LENGTH) return badRequest("The request is too large.", 413);
    body = JSON.parse(raw);
  } catch {
    return badRequest("A valid settings update is required.", 400);
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({
      error: issue?.message ?? "Check the settings and try again.",
      field: issue?.path[0] ?? null,
    }, { status: 400 });
  }

  try {
    const prisma = getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.dealershipSetting.findUnique({
        where: { id: "default" },
        select: selectFields,
      });
      const data = parsed.data;
      const fields = [
        "displayName", "contactPhone", "contactEmail", "whatsappNumber",
        "addressLine", "city", "state", "country", "openingHours",
      ] as const;
      const changedFields = fields.filter((field) => !existing || existing[field] !== data[field]);

      if (existing && changedFields.length === 0) {
        return { settings: existing, unchanged: true };
      }

      const settings = await tx.dealershipSetting.upsert({
        where: { id: "default" },
        create: { id: "default", ...data },
        update: data,
        select: selectFields,
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "DEALERSHIP_SETTINGS_UPDATED",
          entityType: "DealershipSetting",
          entityId: "default",
          metadata: { changedFields },
        },
      });
      return { settings, unchanged: false };
    });

    if (!result.unchanged) {
      revalidatePath("/", "layout");
      revalidatePath("/admin/settings");
    }

    return NextResponse.json(
      { ok: true, unchanged: result.unchanged, settings: result.settings },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Dealership settings update failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("The dealership settings could not be saved. Please try again.", 500);
  }
}
