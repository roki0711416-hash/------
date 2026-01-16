import Link from "next/link";
import { getCurrentUserFromCookies } from "../../lib/auth";
import { BOARDS } from "../../lib/community";
import { getSubscriptionForUserId, isPremiumStatus } from "../../lib/premium";

export const dynamic = "force-dynamic";

export default async function CommunityIndexPage() {
  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">コミュニティ（有料会員限定）</h1>
            <Link
              href="/"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ログインが必要です</p>
            <p className="mt-1 text-sm text-neutral-700">
              コミュニティを見るには、会員登録またはログインしてください。
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
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
  const isPremium = isPremiumPreview || isPremiumStatus(sub?.status ?? null);

  if (!isPremium) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">コミュニティ（有料会員限定）</h1>
            <Link
              href="/account"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← アカウント
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">有料会員限定です</p>
            <p className="mt-1 text-sm text-neutral-700">
              コミュニティは有料会員のみ利用できます。アカウント画面から登録してください。
            </p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
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
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">コミュニティ（有料会員限定）</h1>
          <Link
            href="/account"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
          >
            ← アカウント
          </Link>
        </div>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-800">板一覧</p>
        </div>

        <ul className="mt-4 space-y-2">
          {BOARDS.filter((b) => b.id !== "hall").map((b) => (
            <li key={b.id}>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <Link href={`/community/${b.id}`} className="text-sm font-semibold text-neutral-900">
                  {b.label}
                </Link>
                <Link
                  href={`/community/${b.id}#new-thread`}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
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
