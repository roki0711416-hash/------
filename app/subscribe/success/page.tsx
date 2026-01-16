import Link from "next/link";
import type Stripe from "stripe";
import { getCurrentUserFromCookies } from "../../../lib/auth";
import { getStripe } from "../../../lib/stripe";
import { getSubscriptionForUserId, isPremiumStatus } from "../../../lib/premium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type Plan = "monthly" | "yearly";

function isPlan(v: unknown): v is Plan {
  return v === "monthly" || v === "yearly";
}

function getPriceIdForPlan(plan: Plan) {
  if (plan === "yearly") return process.env.STRIPE_PRICE_ID_YEARLY;
  return process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.STRIPE_PRICE_ID;
}

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const redirectStatus = typeof sp.redirect_status === "string" ? sp.redirect_status : null;
  const setupIntentId = typeof sp.setup_intent === "string" ? sp.setup_intent : null;
  const plan = isPlan(sp.plan) ? sp.plan : "monthly";

  const user = await getCurrentUserFromCookies();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h1 className="text-lg font-semibold">決済</h1>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ログインが必要です</p>
            <p className="mt-1 text-sm text-neutral-700">ログイン後にもう一度お試しください。</p>
            <div className="mt-3">
              <Link
                href="/login"
                className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h1 className="text-lg font-semibold">決済</h1>
          <p className="mt-3 text-sm font-medium text-red-600">STRIPE_SECRET_KEY が未設定です</p>
          <div className="mt-4">
            <Link
              href="/account"
              className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              アカウントへ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (redirectStatus !== "succeeded" || !setupIntentId) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h1 className="text-lg font-semibold">決済</h1>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">決済を完了できませんでした</p>
            <p className="mt-1 text-sm text-neutral-700">もう一度お試しください。</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/subscribe/checkout?plan=${encodeURIComponent(plan)}`}
                className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                もう一度
              </Link>
              <Link
                href="/account"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
              >
                アカウント
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const priceId = getPriceIdForPlan(plan);
  if (!priceId) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h1 className="text-lg font-semibold">決済</h1>
          <p className="mt-3 text-sm font-medium text-red-600">
            {plan === "yearly"
              ? "STRIPE_PRICE_ID_YEARLY が未設定です"
              : "STRIPE_PRICE_ID_MONTHLY（または STRIPE_PRICE_ID）が未設定です"}
          </p>
          <div className="mt-4">
            <Link
              href="/subscribe"
              className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              サブスク登録へ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // すでにサブスクが存在する場合は二重作成しない
  const existingSub = await getSubscriptionForUserId(user.id);
  const hasAnyActiveishSub =
    isPremiumStatus(existingSub?.status ?? null) ||
    (Boolean(existingSub?.stripe_subscription_id) &&
      existingSub?.status !== "canceled" &&
      existingSub?.status !== "incomplete_expired");

  let createdSubscription: Stripe.Subscription | null = null;

  if (!hasAnyActiveishSub) {
    // SetupIntentから支払い方法を取り出し、サブスクを作成
    const si = (await stripe.setupIntents.retrieve(setupIntentId)) as Stripe.SetupIntent;

    const customerId = typeof si.customer === "string" ? si.customer : si.customer?.id;
    const paymentMethodId =
      typeof si.payment_method === "string" ? si.payment_method : si.payment_method?.id;

    if (customerId && paymentMethodId) {
      // ログイン中ユーザーと違う customer での完了を拒否
      if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
        return (
          <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h1 className="text-lg font-semibold">決済</h1>
              <p className="mt-3 text-sm font-medium text-red-600">不正な決済結果です</p>
              <div className="mt-4">
                <Link
                  href="/account"
                  className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  アカウントへ
                </Link>
              </div>
            </section>
          </main>
        );
      }

      createdSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId, quantity: 1 }],
        trial_period_days: 7,
        default_payment_method: paymentMethodId,
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        metadata: { userId: user.id },
      });
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">決済</h1>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-800">購入処理を受け付けました</p>
          <p className="mt-1 text-sm text-neutral-700">
            反映はWebhook経由なので、数秒〜数十秒かかることがあります。
          </p>
          {createdSubscription ? (
            <p className="mt-2 text-xs text-neutral-600">受付ID: {createdSubscription.id}</p>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/account"
            className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
          >
            アカウントへ
          </Link>
          <Link
            href="/subscriber"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
          >
            専用ページ
          </Link>
        </div>
      </section>
    </main>
  );
}
