import RecordClient from "@/app/account/record/RecordClient";
import { getCurrentUserFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  const user = await getCurrentUserFromCookies();
  return <RecordClient isLoggedIn={!!user} userId={user?.id} />;
}
