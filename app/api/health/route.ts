import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: "degraded",
      service: "ritewheel-autos",
      database: "not_configured",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      service: "ritewheel-autos",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check database failure:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      status: "degraded",
      service: "ritewheel-autos",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
