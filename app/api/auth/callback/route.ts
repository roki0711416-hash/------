import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  bindDeviceToUser,
  consumeLoginToken,
  createSession,
  DEVICE_COOKIE,
  SESSION_COOKIE,
} from "../../../../lib/auth";
import { getSiteUrl } from "../../../../lib/site";
import { randomUuid } from "../../../../lib/crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const userId = await consumeLoginToken(token);
  const siteUrl = getSiteUrl();

  if (!userId) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid`, { status: 303 });
  }

  const cookieStore = await cookies();
  const existingDeviceId = cookieStore.get(DEVICE_COOKIE)?.value ?? null;
  const deviceId = existingDeviceId ?? randomUuid();

  const bind = await bindDeviceToUser(userId, deviceId);
  if (!bind.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=device`, { status: 303 });
  }

  const { sessionId, expiresAt } = await createSession(userId);

  const res = NextResponse.redirect(`${siteUrl}/account`, { status: 303 });
  if (!existingDeviceId) {
    res.cookies.set({
      name: DEVICE_COOKIE,
      value: deviceId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return res;
}
