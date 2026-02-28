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
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">サブスク登録</h1>
            <Link
              href="/"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← トップ
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">ログインが必要です</p>
            <p className="mt-1 text-sm text-muted">
              サブスク登録を進めるには、会員登録またはログインしてください。
            </p>
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

  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const sub = await getSubscriptionForUserId(user.id);
  const isPremium = isPremiumPreview || isPremiumForUserAndSubscription(user, sub);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">サブスク登録</h1>
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
          <p className="text-sm font-semibold text-white">会員限定機能</p>
          <p className="mt-1 text-sm text-muted">有料会員になると、会員限定の機能が使えます。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>有料会員限定コミュニティ</li>
            <li>判別ツールの会員限定機能</li>
            <li>広告の非表示</li>
          </ul>
        </div>

        {isPremium ? (
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">すでに有料会員です</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/subscriber"
                className="flex-1 rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                専用ページへ
              </Link>
              <Link
                href="/community"
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                コミュニティへ
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">登録はこちら</p>
            <p className="mt-1 text-sm text-muted">
              月額680円
            </p>
            <p className="mt-1 text-sm text-muted">2日間無料</p>
            <p className="mt-1 text-sm text-muted">設定判別・続行判断をすべて体験できます</p>
            <p className="mt-1 text-xs text-white/40">※初回のみ。2日間無料終了後は月額680円で自動更新されます</p>
            <p className="mt-1 text-xs text-white/40">クレカ登録のみ・すぐ解約OK</p>
            <SubscribeCheckoutButton showYearly={false} />
            <p className="mt-2 text-xs text-white/40">※登録後の管理（解約など）はアカウント画面から行えます。</p>
          </div>
        )}
      </section>
    </main>
  );
}
