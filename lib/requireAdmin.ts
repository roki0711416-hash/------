import { NextResponse } from "next/server";
import { getCurrentUserFromCookies, type CurrentUser } from "./auth";

type RequireAdminResult =
  | { user: CurrentUser; forbiddenResponse?: never }
  | { user?: never; forbiddenResponse: NextResponse };

export async function requireAdmin(): Promise<RequireAdminResult> {
  const user = await getCurrentUserFromCookies();

  if (!user || user.role !== "admin") {
    return {
      forbiddenResponse: NextResponse.json(
        { error: "管理者のみ実行できます。" },
        { status: 403 },
      ),
    };
  }

  return { user };
}
