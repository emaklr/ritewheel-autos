import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enquirySchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(30),
  message: z.string().trim().max(2000).optional().default(""),
  vehicleSlug: z.string().trim().max(120).optional().default(""),
  website: z.string().max(200).optional().default("")
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please check the details and try again.", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.website) return Response.json({ ok: true, reference: "REQUEST-RECEIVED" });

  if (!prisma) {
    return Response.json(
      { error: "Enquiry submission is not connected yet. PostgreSQL must be configured before customer requests can be stored." },
      { status: 503 }
    );
  }

  try {
    let vehicleId: string | undefined;
    if (parsed.data.vehicleSlug) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { slug: parsed.data.vehicleSlug, publishedAt: { not: null }, status: { in: ["AVAILABLE", "RESERVED", "SOLD"] } },
        select: { id: true }
      });
      if (!vehicle) return Response.json({ error: "This vehicle listing is no longer available. Please refresh and try again." }, { status: 404 });
      vehicleId = vehicle.id;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: parsed.data.customerName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        message: parsed.data.message || null,
        vehicleId,
        source: vehicleId ? "VEHICLE_DETAIL" : "CONTACT_PAGE"
      },
      select: { reference: true }
    });
    return Response.json({ ok: true, reference: enquiry.reference }, { status: 201 });
  } catch (error) {
    console.error("Enquiry creation failed.", error);
    return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
  }
}