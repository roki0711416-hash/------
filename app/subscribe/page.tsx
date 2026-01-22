import Link from "next/link";
import SubscribeCheckoutButton from "../../components/SubscribeCheckoutButton";
import { getCurrentUserFromCookies } from "../../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../lib/premium";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク登録</h1>
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
              サブスク登録を進めるには、会員登録またはログインしてください。
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

  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const sub = await getSubscriptionForUserId(user.id);
  const isPremium = isPremiumPreview || isPremiumForUserAndSubscription(user, sub);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">サブスク登録</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
            <Link
              href="/account"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              アカウント
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-800">会員限定機能</p>
          <p className="mt-1 text-sm text-neutral-700">有料会員になると、会員限定の機能が使えます。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>有料会員限定コミュニティ</li>
            <li>判別ツールの会員限定機能</li>
            <li>広告の非表示</li>
          </ul>
        </div>

        {isPremium ? (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">すでに有料会員です</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/subscriber"
                className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                専用ページへ
              </Link>
              <Link
                href="/community"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
              >
                コミュニティへ
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">登録はこちら</p>
            <p className="mt-1 text-sm text-neutral-700">
              月額680円
            </p>
            <p className="mt-1 text-sm text-neutral-700">2日間無料</p>
            <p className="mt-1 text-sm text-neutral-700">設定判別・続行判断をすべて体験できます</p>
            <p className="mt-1 text-xs text-neutral-500">※初回のみ。2日間無料終了後は月額680円で自動更新されます</p>
            <p className="mt-1 text-xs text-neutral-500">クレカ登録のみ・すぐ解約OK</p>
            <SubscribeCheckoutButton showYearly={false} />
            <p className="mt-2 text-xs text-neutral-500">※登録後の管理（解約など）はアカウント画面から行えます。</p>
          </div>
        )}
      </section>
    </main>
  );
}
