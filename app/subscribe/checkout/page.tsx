import Link from "next/link";
import { getCurrentUserFromCookies } from "../../../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../../lib/premium";
import { STRIPE_PAYMENT_LINK_URL } from "../../../lib/stripePaymentLink";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SubscribeCheckoutPage() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">決済</h1>
            <Link
              href="/subscribe"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← 戻る
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ログインが必要です</p>
            <p className="mt-1 text-sm text-neutral-700">
              決済を進めるには、会員登録またはログインしてください。
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
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const isPremium = isPremiumPreview || isPremiumForUserAndSubscription(user, sub);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">決済</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/subscribe"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← 戻る
            </Link>
            <Link
              href="/account"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              アカウント
            </Link>
          </div>
        </div>

        {isPremium ? (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">すでに有料会員です</p>
            <p className="mt-1 text-sm text-neutral-700">
              解約・プラン管理はアカウント画面から行えます。
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
        ) : (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">決済はこちら</p>
            <p className="mt-1 text-sm text-neutral-700">2日間無料（その後 月額680円）</p>
            <p className="mt-1 text-xs text-neutral-500">※登録後の管理（解約など）はアカウント画面から行えます。</p>
            <div className="mt-3">
              <a
                href={STRIPE_PAYMENT_LINK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                決済ページを開く
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
