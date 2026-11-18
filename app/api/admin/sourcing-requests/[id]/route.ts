import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { isSameOriginRequest, requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 1_000;
const statuses = ["NEW", "REVIEWING", "SOURCING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"] as const;
const updateSchema = z.object({
  status: z.enum(statuses),
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
  if (!isSameOriginRequest(request)) return badRequest("This request origin is not allowed.", 403);

  const { id } = await context.params;
  if (!id || id.length > 100) return badRequest("Invalid vehicle request reference.", 400);

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
    return badRequest("A valid status update is required.", 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Choose a valid request status.", 400);

  const transitions: Record<(typeof statuses)[number], readonly string[]> = {
    NEW: ["REVIEWING", "DECLINED", "CANCELLED", "CLOSED"],
    REVIEWING: ["SOURCING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
    SOURCING: ["REVIEWING", "MATCH_FOUND", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
    MATCH_FOUND: ["SOURCING", "UNAVAILABLE", "DECLINED", "CANCELLED", "CLOSED"],
    UNAVAILABLE: [],
    DECLINED: [],
    CANCELLED: [],
    CLOSED: [],
  };

  try {
    const prisma = getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.sourcingRequest.findUnique({
        where: { id },
        select: { id: true, reference: true, status: true },
      });
      if (!existing) return { missing: true as const };

      const nextStatus = parsed.data.status;
      if (existing.status === nextStatus) {
        return { item: existing, unchanged: true as const };
      }
      if (!transitions[existing.status as (typeof statuses)[number]]?.includes(nextStatus)) {
        return { conflict: true as const };
      }

      const updated = await tx.sourcingRequest.update({
        where: { id },
        data: { status: nextStatus },
        select: { id: true, reference: true, status: true },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "SOURCING_REQUEST_STATUS_CHANGED",
          entityType: "SourcingRequest",
          entityId: existing.id,
          metadata: {
            reference: existing.reference,
            previousStatus: existing.status,
            nextStatus: updated.status,
          },
        },
      });

      return { item: updated, unchanged: false as const };
    });

    if ("missing" in result) return badRequest("Vehicle request not found.", 404);
    if ("conflict" in result) return badRequest("This vehicle request cannot move to that status.", 409);

    return NextResponse.json(
      { ok: true, request: result.item, unchanged: result.unchanged },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Admin sourcing request update failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("The vehicle request could not be updated. Please try again.", 500);
  }
}
