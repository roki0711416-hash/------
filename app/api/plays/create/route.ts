import { NextResponse } from "next/server";
import { getViewer } from "../../../../lib/auth";
import { getMachineById } from "../../../../lib/machines";
import { createPlayInputFromFormData, insertPlay } from "../../../../lib/plays";

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.premium) {
    return NextResponse.redirect(new URL("/account", req.url), 303);
  }

  const fd = await req.formData();
  const returnMonthRaw = String(fd.get("returnMonth") ?? "").trim();
  // server-only userId を強制
  fd.set("userId", viewer.userId);

  const input = createPlayInputFromFormData(fd);
  if (!input) {
    return NextResponse.redirect(new URL("/log?error=invalid", req.url), 303);
  }

  input.userId = viewer.userId;
  const machine = await getMachineById(input.machineId);
  if (!machine) {
    return NextResponse.redirect(new URL("/log?error=invalid", req.url), 303);
  }
  input.machineName = machine.name;
  try {
    await insertPlay(input);
  } catch (e) {
    const code = (e as { code?: unknown } | null)?.code;
    if (code === "42P01") {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "missing_table");
      u.hash = "new";
      return NextResponse.redirect(u, 303);
    }
    if (code === "22P02") {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "invalid_user");
      u.hash = "new";
      return NextResponse.redirect(u, 303);
    }
    const msg = (e as { message?: unknown } | null)?.message;
    if (typeof msg === "string" && msg.includes("DBが未設定")) {
      const u = new URL("/log", req.url);
      if (/^\d{4}-\d{2}$/.test(returnMonthRaw)) u.searchParams.set("month", returnMonthRaw);
      u.searchParams.set("error", "db_missing");
      u.hash = "new";
      return NextResponse.redirect(u, 303);
    }
    throw e;
  }

  const month = /^\d{4}-\d{2}$/.test(returnMonthRaw)
    ? returnMonthRaw
    : input.playedOn.slice(0, 7);
  const u = new URL("/log", req.url);
  u.searchParams.set("month", month);
  u.searchParams.set("ok", "1");
  u.hash = `d-${input.playedOn}`;
  return NextResponse.redirect(u, 303);
}
