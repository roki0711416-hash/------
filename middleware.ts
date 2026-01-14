import { NextResponse, type NextRequest } from "next/server";
const DEVICE_COOKIE = "slokasu_device";

function shouldSkip(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  return false;
}

export function middleware(req: NextRequest) {
  if (shouldSkip(req.nextUrl.pathname)) return NextResponse.next();

  const device = req.cookies.get(DEVICE_COOKIE)?.value;
  if (device) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set({
    name: DEVICE_COOKIE,
    value: crypto.randomUUID(),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
