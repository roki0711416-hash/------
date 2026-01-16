import Link from "next/link";
import { redirect } from "next/navigation";
import SignupForm from "../../components/SignupForm";
import { getCurrentUserFromCookies } from "../../lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUserFromCookies();
  if (user) redirect("/account");

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">会員登録</h1>
        <p className="mt-2 text-sm text-neutral-600">
          登録すると、サブスク購入と会員状態の確認ができます。
        </p>

        <SignupForm />

        <p className="mt-4 text-sm text-neutral-700">
          既にアカウントがある方：{" "}
          <Link href="/login" className="underline underline-offset-2">
            ログイン
          </Link>
        </p>
      </section>
    </main>
  );
}
