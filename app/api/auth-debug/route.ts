import { NextResponse } from "next/server";
import { getCurrentUserFromCookies } from "../../../lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUserFromCookies();
  console.log("[auth-debug]", user?.role, user?.id);

  return NextResponse.json({
    role: user?.role ?? null,
    id: user?.id ?? null,
  });
}
