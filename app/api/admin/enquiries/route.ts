import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"] as const;

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin) {
    return NextResponse.json(
      { error: "Administrator sign-in required." },
      { status: 401 },
    );
  }

  try {
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().slice(0, 100) ?? "";
    const statusRaw = params.get("status");
    const sourceRaw = params.get("source");

    const status = statuses.includes(statusRaw as (typeof statuses)[number])
      ? (statusRaw as (typeof statuses)[number])
      : undefined;
    const sources = ["PURCHASE_INTENT", "VEHICLE_DETAIL", "CONTACT_PAGE"] as const;
    const source = sources.includes(sourceRaw as (typeof sources)[number]) ? sourceRaw as (typeof sources)[number] : undefined;

    const pageRaw = Number(params.get("page") ?? "1");
    const page = Number.isInteger(pageRaw) && pageRaw > 0
      ? Math.min(pageRaw, 1000)
      : 1;
    const pageSize = 20;

    const where = {
      ...(status ? { status } : {}),
      ...(source ? { source } : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q, mode: "insensitive" as const } },
              { reference: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const prisma = getPrismaClient();
    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          reference: true,
          customerName: true,
          email: true,
          phone: true,
          message: true,
          source: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vehicle: {
            select: {
              id: true,
              slug: true,
              make: true,
              model: true,
              trim: true,
              year: true,
              status: true,
              price: true,
              currency: true,
            },
          },
        },
      }),
      prisma.enquiry.count({ where }),
    ]);

    return NextResponse.json(
      {
        enquiries,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error(
      "Admin enquiry retrieval failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Unable to retrieve enquiries. Please try again." },
      { status: 500 },
    );
  }
}
