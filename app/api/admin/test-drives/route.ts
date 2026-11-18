import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statuses = ["REQUESTED", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const;

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Administrator sign-in required." }, { status: 401 });
  }

  try {
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().slice(0, 100) ?? "";
    const statusRaw = params.get("status");
    const status = statuses.includes(statusRaw as (typeof statuses)[number])
      ? (statusRaw as (typeof statuses)[number])
      : undefined;
    const pageRaw = Number(params.get("page") ?? "1");
    const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;
    const pageSize = 20;
    const where = {
      ...(status ? { status } : {}),
      ...(q ? {
        OR: [
          { customerName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
          { reference: { contains: q, mode: "insensitive" as const } },
          { vehicle: { is: { OR: [
            { make: { contains: q, mode: "insensitive" as const } },
            { model: { contains: q, mode: "insensitive" as const } },
          ] } } },
        ],
      } : {}),
    };

    const prisma = getPrismaClient();
    const [requests, total] = await Promise.all([
      prisma.testDriveRequest.findMany({
        where,
        orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, reference: true, customerName: true, email: true, phone: true,
          preferredDate: true, preferredTime: true, confirmedDate: true, confirmedTime: true,
          status: true, createdAt: true,
          vehicle: { select: { slug: true, make: true, model: true, trim: true, year: true } },
        },
      }),
      prisma.testDriveRequest.count({ where }),
    ]);

    return NextResponse.json(
      { requests, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Admin test-drive retrieval failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Unable to retrieve test-drive requests." }, { status: 500 });
  }
}
