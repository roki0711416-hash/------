import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "../../../lib/auth";
import AdminReportsClient from "./AdminReportsClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "通報管理 | スロカスくん管理者",
  robots: "noindex, nofollow",
};

export default async function AdminReportsPage() {
  const user = await getCurrentUserFromCookies();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <AdminReportsClient />;
}
