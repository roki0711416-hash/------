import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "../../components/LoginForm";
import { getCurrentUserFromCookies } from "../../lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUserFromCookies();
  if (user) redirect("/account");

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <h1 className="text-lg font-semibold">ログイン</h1>
        <p className="mt-2 text-sm text-muted">
          端末共有NGのため、ログインは常に「最後の1台のみ」有効になります。
        </p>

        <LoginForm />

        <p className="mt-4 text-sm text-muted">
          まだアカウントがない方：{" "}
          <Link href="/signup" className="underline underline-offset-2">
            会員登録
          </Link>
        </p>
      </section>
    </main>
  );
}
