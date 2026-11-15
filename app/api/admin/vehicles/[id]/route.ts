import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrismaClient } from "@/lib/db";
import { requireAdminApi, isSameOriginRequest } from "@/lib/admin-auth";
import { adminVehicleInputSchema, vehiclePublishedAt, vehicleScalarData } from "@/lib/admin-vehicle-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 20_000;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Administrator sign-in required." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });

  const { id } = await context.params;
  if (!id || id.length > 100) return NextResponse.json({ error: "Invalid vehicle reference." }, { status: 400 });

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
  const prisma = getPrismaClient();

  try {
    const existing = await prisma.vehicle.findUnique({
      where: { id },
      select: {
        id: true, slug: true, status: true, price: true, currency: true,
        publishedAt: true, featured: true, isDemo: true,
      },
    });
    if (!existing) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });

    const nextData = vehicleScalarData(input, vehiclePublishedAt(input.status, existing.publishedAt));
    const duplicate = await prisma.vehicle.findFirst({
      where: { slug: nextData.slug, NOT: { id } },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: "A vehicle with this URL slug already exists." }, { status: 409 });

    const updated = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.update({
        where: { id },
        data: {
          ...nextData,
          images: {
            deleteMany: {},
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

      const changedFields = [
        ...(existing.status !== input.status ? ["status"] : []),
        ...(existing.price?.toString() !== input.price ? ["price"] : []),
        ...(existing.currency !== input.currency ? ["currency"] : []),
        ...(existing.featured !== input.featured ? ["featured"] : []),
        ...(existing.isDemo !== input.isDemo ? ["isDemo"] : []),
      ];

      await tx.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: existing.status !== input.status ? "VEHICLE_UPDATED_STATUS_OR_DETAILS" : "VEHICLE_UPDATED",
          entityType: "Vehicle",
          entityId: id,
          metadata: {
            previousSlug: existing.slug,
            nextSlug: vehicle.slug,
            previousStatus: existing.status,
            nextStatus: input.status,
            previousPrice: existing.price?.toString() ?? null,
            nextPrice: input.price,
            previousCurrency: existing.currency,
            nextCurrency: input.currency,
            changedFields,
            imageCount: input.images.length,
          },
        },
      });

      return vehicle;
    });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/vehicles/${existing.slug}`);
    revalidatePath(`/vehicles/${updated.slug}`);
    return NextResponse.json({ ok: true, vehicle: updated });
  } catch {
    return NextResponse.json({ error: "The vehicle could not be updated. Please try again." }, { status: 500 });
  }
}
