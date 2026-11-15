import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL || !prisma) {
    return Response.json({
      status: "degraded",
      service: "ritewheel-autos",
      database: "not_configured",
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      service: "ritewheel-autos",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check database failure.", error);
    return Response.json({
      status: "degraded",
      service: "ritewheel-autos",
      database: "unavailable",
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
