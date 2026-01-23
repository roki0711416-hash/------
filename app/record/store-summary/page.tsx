import { getCurrentUserFromCookies } from "@/lib/auth";

import StoreSummaryClient from "./StoreSummaryClient";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function RecordStoreSummaryPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const user = await getCurrentUserFromCookies();
  const sp = await searchParams;

  const shop = firstString(sp?.shop) ?? "";

  return <StoreSummaryClient isLoggedIn={Boolean(user)} userId={user?.id} shopName={shop} />;
}
