import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { isSameOriginRequest, requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 1_000;
const updateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"]),
}).strict();

function badRequest(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) return badRequest("Administrator sign-in required.", 401);
  if (!isSameOriginRequest(request)) {
    return badRequest("This request origin is not allowed.", 403);
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return badRequest("Invalid enquiry reference.", 400);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return badRequest("The request is too large.", 413);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_LENGTH) {
      return badRequest("The request is too large.", 413);
    }
    body = JSON.parse(raw);
  } catch {
    return badRequest("A valid status update is required.", 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Choose a valid enquiry status.", 400);
  }

  try {
    const prisma = getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.enquiry.findUnique({
        where: { id },
        select: { id: true, reference: true, status: true },
      });

      if (!existing) return null;
      if (existing.status === parsed.data.status) {
        return { id: existing.id, reference: existing.reference, status: existing.status };
      }

      const updated = await tx.enquiry.update({
        where: { id },
        data: { status: parsed.data.status },
        select: { id: true, reference: true, status: true },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "ENQUIRY_STATUS_CHANGED",
          entityType: "Enquiry",
          entityId: existing.id,
          metadata: {
            reference: existing.reference,
            previousStatus: existing.status,
            nextStatus: updated.status,
          },
        },
      });

      return updated;
    });

    if (!result) return badRequest("Enquiry not found.", 404);

    return NextResponse.json(
      { ok: true, enquiry: result },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error(
      "Admin enquiry status update failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return badRequest("The enquiry status could not be updated. Please try again.", 500);
  }
}
