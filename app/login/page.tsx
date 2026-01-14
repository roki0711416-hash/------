import Link from "next/link";

export const metadata = {
  title: "ログイン | スロット設定判別ツール",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">ログイン</h1>
        <p className="mt-2 text-sm text-neutral-700">
          メールアドレスにログインリンクを送ります。
        </p>

        <form action="/api/auth/request" method="post" className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">メールアドレス</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            ログインリンクを送信
          </button>

          <p className="text-xs text-neutral-500">
            迷惑メールフォルダもご確認ください。
          </p>
        </form>

        <div className="mt-6">
          <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
