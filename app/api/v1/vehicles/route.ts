import { z } from "zod";
import { getVehicles, getVehiclesBySlugs } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().max(80).optional(),
  make: z.string().trim().max(60).optional(),
  bodyType: z.string().trim().max(40).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  currency: z.string().trim().length(3).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "year"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(24).default(12)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slugsRaw = url.searchParams.get("slugs");

  if (slugsRaw !== null) {
    const slugs = slugsRaw.split(",").map((slug) => slug.trim()).filter(Boolean);
    if (
      slugs.length > 50 ||
      slugs.some((slug) => !/^[a-z0-9-]{3,100}$/.test(slug)) ||
      new Set(slugs).size !== slugs.length
    ) {
      return Response.json({ error: "A maximum of fifty unique valid vehicle slugs can be requested." }, { status: 400 });
    }
    try {
      const result = await getVehiclesBySlugs(slugs);
      return Response.json(result, { headers: { "cache-control": "private, no-store" } });
    } catch (error) {
      console.error("Guest vehicle collection lookup failed.", error);
      return Response.json({ error: "Saved vehicles could not be loaded." }, { status: 503 });
    }
  }

  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return Response.json({ error: "Invalid inventory filters.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await getVehicles(parsed.data);
    return Response.json(result, {
      headers: { "cache-control": result.isDemoMode ? "no-store" : "private, max-age=0, must-revalidate" }
    });
  } catch (error) {
    console.error("Vehicle inventory query failed.", error);
    return Response.json({ error: "Vehicle inventory is temporarily unavailable." }, { status: 503 });
  }
}