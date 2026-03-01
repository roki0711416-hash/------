import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth";
import AdminStoresClient from "./AdminStoresClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "店舗管理 | スロカスくん管理者",
  robots: "noindex, nofollow",
};

export default async function AdminStoresPage() {
  const user = await getCurrentUserFromCookies();
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <AdminStoresClient />;
}
