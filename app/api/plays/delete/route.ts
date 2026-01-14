import { NextResponse } from "next/server";
import { getViewer } from "../../../../lib/auth";
import { deletePlayForUser } from "../../../../lib/plays";

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.premium) {
    return NextResponse.redirect(new URL("/account", req.url), 303);
  }

  const fd = await req.formData();
  const playId = String(fd.get("playId") ?? "").trim();
  const returnMonthRaw = String(fd.get("returnMonth") ?? "").trim();
  const returnDateRaw = String(fd.get("returnDate") ?? "").trim();
  if (!playId) {
    return NextResponse.redirect(new URL("/log?error=invalid", req.url), 303);
  }

  try {
    await deletePlayForUser(viewer.userId, playId);
  } catch (e) {
    const code = (e as { code?: unknown } | null)?.code;
    if (code === "42P01") {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "missing_table");
      return NextResponse.redirect(u, 303);
    }
    if (code === "22P02") {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "invalid_user");
      return NextResponse.redirect(u, 303);
    }
    const msg = (e as { message?: unknown } | null)?.message;
    if (typeof msg === "string" && msg.includes("DBが未設定")) {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "db_missing");
      return NextResponse.redirect(u, 303);
    }
    throw e;
  }

  const u = new URL("/log", req.url);
  if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(returnDateRaw)) u.hash = `d-${returnDateRaw}`;
  return NextResponse.redirect(u, 303);
}
