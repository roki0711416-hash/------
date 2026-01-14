import { NextResponse } from "next/server";
import { consumeDeviceResetToken } from "../../../../../lib/auth";
import { getSiteUrl } from "../../../../../lib/site";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const userId = await consumeDeviceResetToken(token);
  const siteUrl = getSiteUrl();

  if (!userId) {
    return NextResponse.redirect(`${siteUrl}/account?reset=invalid`, { status: 303 });
  }

  return NextResponse.redirect(`${siteUrl}/login?reset=done`, { status: 303 });
}
