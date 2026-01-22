import { getCurrentUserFromCookies } from "../../../lib/auth";
import RecordClient from "./RecordClient";

export const dynamic = "force-dynamic";

export default async function AccountRecordPage() {
  const user = await getCurrentUserFromCookies();
  return <RecordClient isLoggedIn={Boolean(user)} userId={user?.id} />;
}
