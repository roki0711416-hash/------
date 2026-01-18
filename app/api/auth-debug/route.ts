import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const user = auth.user;
  console.log("[auth-debug]", user?.role, user?.id);

  return NextResponse.json({
    role: user?.role ?? null,
    id: user?.id ?? null,
  });
}
