import { NextResponse } from "next/server";
import { z } from "zod";
import { getVehiclesByIds, searchVehicles } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().max(80).optional(),
  make: z.string().trim().max(60).optional(),
  bodyType: z.string().trim().max(40).optional(),
  maxBudget: z.coerce.number().positive().max(10_000_000_000).optional(),
  sort: z.enum(["newest", "price-low", "price-high"]).default("newest"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const idsRaw = url.searchParams.get("ids");
  if (idsRaw !== null) {
    const ids = idsRaw.split(",").map((id) => id.trim()).filter(Boolean);
    if (ids.length > 3 || ids.some((id) => id.length > 40)) {
      return NextResponse.json({ error: "A maximum of three valid vehicle IDs can be requested." }, { status: 400 });
    }
    try {
      return NextResponse.json(await getVehiclesByIds(ids), {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      console.error("Vehicle lookup failed:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ error: "Vehicles could not be loaded." }, { status: 503 });
    }
  }

  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json({
      error: "Invalid inventory search parameters.",
      details: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  try {
    const result = await searchVehicles(parsed.data);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Inventory query failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The inventory could not be loaded. Please try again." }, { status: 503 });
  }
}
