import { NextResponse } from "next/server";
import { clearAdminSessionCookie, isSameOriginRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  await clearAdminSessionCookie(response);
  return response;
}
