import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrismaClient } from "@/lib/db";
import { isSameOriginRequest, requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 1_000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const updateSchema = z.object({
  status: z.enum(["REQUESTED", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"]),
  confirmedDate: z.string().regex(datePattern).refine(isValidDateOnly, "Choose a real calendar date.").optional(),
  confirmedTime: z.string().regex(timePattern).optional(),
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
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

function isFutureLocalSlot(date: string, time: string) {
  const now = nigeriaNow();
  return date > now.date || (date === now.date && time > now.time);
}

function dateOnlyValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) return badRequest("Administrator sign-in required.", 401);
  if (!isSameOriginRequest(request)) return badRequest("This request origin is not allowed.", 403);

  const { id } = await context.params;
  if (!id || id.length > 100) return badRequest("Invalid test-drive reference.", 400);

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
    return badRequest("A valid test-drive update is required.", 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Choose a valid status and appointment time.", 400);
  if (Boolean(parsed.data.confirmedDate) !== Boolean(parsed.data.confirmedTime)) {
    return badRequest("Provide both the confirmed date and confirmed time.", 400);
  }
  if (parsed.data.status === "ACCEPTED") {
    if (!parsed.data.confirmedDate || !parsed.data.confirmedTime) {
      return badRequest("A confirmed date and time are required before accepting this request.", 400);
    }
    if (!isFutureLocalSlot(parsed.data.confirmedDate, parsed.data.confirmedTime)) {
      return badRequest("The confirmed appointment must be in the future (WAT).", 400);
    }
  }

  try {
    const prisma = getPrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.testDriveRequest.findUnique({
        where: { id },
        select: {
          id: true, reference: true, status: true,
          confirmedDate: true, confirmedTime: true,
        },
      });
      if (!existing) return { missing: true as const };

      const allowed: Record<string, string[]> = {
        REQUESTED: ["ACCEPTED", "DECLINED", "CANCELLED"],
        ACCEPTED: ["ACCEPTED", "COMPLETED", "CANCELLED"],
        DECLINED: [],
        COMPLETED: [],
        CANCELLED: [],
      };
      const nextStatus = parsed.data.status;
      const sameStatus = existing.status === nextStatus;
      if (!sameStatus && !allowed[existing.status]?.includes(nextStatus)) {
        return { conflict: true as const };
      }

      const nextConfirmedDate = nextStatus === "ACCEPTED"
        ? new Date(`${parsed.data.confirmedDate}T00:00:00.000Z`)
        : nextStatus === "DECLINED" || nextStatus === "CANCELLED"
          ? null
          : existing.confirmedDate;
      const nextConfirmedTime = nextStatus === "ACCEPTED"
        ? parsed.data.confirmedTime!
        : nextStatus === "DECLINED" || nextStatus === "CANCELLED"
          ? null
          : existing.confirmedTime;

      const appointmentChanged =
        dateOnlyValue(existing.confirmedDate) !== dateOnlyValue(nextConfirmedDate) ||
        existing.confirmedTime !== nextConfirmedTime;
      if (sameStatus && !appointmentChanged) {
        return {
          item: {
            id: existing.id,
            reference: existing.reference,
            status: existing.status,
            confirmedDate: existing.confirmedDate,
            confirmedTime: existing.confirmedTime,
          },
          unchanged: true as const,
        };
      }

      const updated = await tx.testDriveRequest.update({
        where: { id },
        data: {
          status: nextStatus,
          confirmedDate: nextConfirmedDate,
          confirmedTime: nextConfirmedTime,
        },
        select: {
          id: true, reference: true, status: true, confirmedDate: true, confirmedTime: true,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: sameStatus ? "TEST_DRIVE_APPOINTMENT_UPDATED" : "TEST_DRIVE_STATUS_CHANGED",
          entityType: "TestDriveRequest",
          entityId: existing.id,
          metadata: {
            reference: existing.reference,
            previousStatus: existing.status,
            nextStatus: updated.status,
            previousConfirmedDate: existing.confirmedDate?.toISOString() ?? null,
            previousConfirmedTime: existing.confirmedTime,
            nextConfirmedDate: updated.confirmedDate?.toISOString() ?? null,
            nextConfirmedTime: updated.confirmedTime,
          },
        },
      });

      return { item: updated, unchanged: false as const };
    });

    if ("missing" in result) return badRequest("Test-drive request not found.", 404);
    if ("conflict" in result) return badRequest("This test-drive request cannot move to that status.", 409);

    return NextResponse.json(
      { ok: true, request: result.item, unchanged: result.unchanged },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Admin test-drive update failed:", error instanceof Error ? error.message : "Unknown error");
    return badRequest("The test-drive request could not be updated. Please try again.", 500);
  }
}
