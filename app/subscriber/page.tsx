import Link from "next/link";
import { getCurrentUserFromCookies } from "../../lib/auth";
import { BOARDS } from "../../lib/community";
import { getDb } from "../../lib/db";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../lib/premium";

export const dynamic = "force-dynamic";

export default async function SubscriberPage() {
  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク会員専用</h1>
            <Link
              href="/"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">ログインが必要です</p>
            <p className="mt-1 text-sm text-muted">会員情報を入力してログインしてください。</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const sub = await getSubscriptionForUserId(user.id);
  const isPremium = isPremiumPreview || isPremiumForUserAndSubscription(user, sub);

  if (!isPremium) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク会員専用</h1>
            <Link
              href="/account"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← アカウント
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">有料会員限定です</p>
            <p className="mt-1 text-sm text-muted">アカウント画面から登録してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                アカウントへ
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted">
              登録ページ：{" "}
              <Link href="/subscribe" className="underline underline-offset-2">
                /subscribe
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const db = getDb();
  if (!db) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク会員専用</h1>
            <Link
              href="/"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">DBが未設定です</p>
            <p className="mt-1 text-sm text-muted">DATABASE_URL または POSTGRES_URL を設定してください。</p>
          </div>
        </section>
      </main>
    );
  }

  const { rows: userRows } =
    await db.sql`SELECT username FROM users WHERE id = ${user.id} LIMIT 1`;
  const userRow = userRows[0] as { username: string | null } | undefined;
  const username = (userRow?.username ?? "").trim() || null;

  if (!username) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク会員専用</h1>
            <Link
              href="/account"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← アカウント
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">ユーザーネーム設定が必要です</p>
            <p className="mt-1 text-sm text-muted">/account からユーザーネームを設定してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                アカウントへ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">サブスク会員専用</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
            <Link
              href="/account"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              アカウント
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
          <p className="text-sm font-semibold text-white">コミュニティ</p>
          <p className="mt-1 text-xs text-muted">ログイン中：{username}</p>
        </div>

        <ul className="mt-4 space-y-2">
          {BOARDS.filter((b) => b.id !== "hall").map((b) => (
            <li key={b.id}>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                <Link href={`/community/${b.id}`} className="text-sm font-semibold text-white">
                  {b.label}
                </Link>
                <Link
                  href={`/community/${b.id}#new-thread`}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-muted"
                >
                  スレ立て
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
