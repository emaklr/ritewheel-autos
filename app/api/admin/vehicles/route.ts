import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrismaClient } from "@/lib/db";
import { requireAdminApi, isSameOriginRequest } from "@/lib/admin-auth";
import { adminVehicleInputSchema, vehiclePublishedAt, vehicleScalarData } from "@/lib/admin-vehicle-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 20_000;

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Administrator sign-in required." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_LENGTH) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "A valid vehicle record is required." }, { status: 400 });
  }

  const parsed = adminVehicleInputSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({
      error: firstIssue?.message ?? "Check the vehicle details and try again.",
      field: firstIssue?.path.join("."),
    }, { status: 400 });
  }

  const input = parsed.data;
  const slug = vehicleScalarData(input, null).slug;
  if (!slug) return NextResponse.json({ error: "Enter a valid vehicle URL slug." }, { status: 400 });

  try {
    const prisma = getPrismaClient();
    const duplicate = await prisma.vehicle.findUnique({ where: { slug }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "A vehicle with this URL slug already exists." }, { status: 409 });

    const publishedAt = vehiclePublishedAt(input.status);
    const vehicle = await prisma.$transaction(async (tx) => {
      const created = await tx.vehicle.create({
        data: {
          ...vehicleScalarData(input, publishedAt),
          images: {
            create: input.images.map((image, index) => ({
              url: image.url,
              altText: image.altText ?? `${input.make} ${input.model} image ${index + 1}`,
              sortOrder: index,
              isPrimary: index === 0,
              imageType: "GALLERY",
            })),
          },
        },
        select: { id: true, slug: true, status: true },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "VEHICLE_CREATED",
          entityType: "Vehicle",
          entityId: created.id,
          metadata: {
            slug: created.slug,
            status: created.status,
            featured: input.featured,
            isDemo: input.isDemo,
            imageCount: input.images.length,
          },
        },
      });

      return created;
    });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/vehicles/${vehicle.slug}`);
    return NextResponse.json({ ok: true, vehicle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The vehicle could not be created. Please try again." }, { status: 500 });
  }
}
