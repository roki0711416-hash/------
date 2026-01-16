"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type Plan = "monthly" | "yearly";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

function isPlan(v: string | null): v is Plan {
  return v === "monthly" || v === "yearly";
}

function PlanPicker({
  plan,
  hasYearly,
  setPlan,
  loading,
}: {
  plan: Plan;
  hasYearly: boolean;
  setPlan: (p: Plan) => void;
  loading: boolean;
}) {
  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-sm font-semibold text-neutral-800">プラン</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPlan("monthly")}
          disabled={loading}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold disabled:opacity-60 ${
            plan === "monthly"
              ? "border-neutral-900 bg-white text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-900"
          }`}
        >
          <div>月額</div>
          <div className="mt-1 text-xs font-medium text-neutral-600">
            税込680円/月・7日間無料トライアル
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPlan("yearly")}
          disabled={loading || !hasYearly}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold disabled:opacity-60 ${
            plan === "yearly"
              ? "border-neutral-900 bg-white text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-900"
          }`}
        >
          <div>年額</div>
          <div className="mt-1 text-xs font-medium text-neutral-600">
            税込6,800円/年・7日間無料トライアル
          </div>
        </button>
      </div>
      {!hasYearly ? (
        <p className="mt-2 text-xs text-neutral-600">※年額プランは現在準備中です。</p>
      ) : null}
    </div>
  );
}

function InnerForm({ plan }: { plan: Plan }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const returnUrl = `${window.location.origin}/subscribe/success?plan=${encodeURIComponent(plan)}`;

      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (result.error) {
        setError(result.error.message ?? "決済の確認に失敗しました");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <p className="text-sm font-semibold text-neutral-900">お支払い情報</p>
        <p className="mt-1 text-xs text-neutral-600">
          7日間無料トライアル中は請求されません。終了後に自動で課金が開始されます。
        </p>
        <div className="mt-3">
          <PaymentElement />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "処理中..." : "この内容で進む"}
      </button>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex items-center justify-between">
        <Link
          href="/subscribe/cancel"
          className="text-sm font-medium text-neutral-700 underline underline-offset-2"
        >
          やめる
        </Link>
        <Link
          href="/account"
          className="text-sm font-medium text-neutral-700 underline underline-offset-2"
        >
          アカウントへ
        </Link>
      </div>
    </form>
  );
}

export default function CheckoutClient({ hasYearly }: { hasYearly: boolean }) {
  const sp = useSearchParams();

  const initialPlan = useMemo<Plan>(() => {
    const q = sp.get("plan");
    if (isPlan(q)) return q;
    return "monthly";
  }, [sp]);

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan === "yearly" && !hasYearly) setPlan("monthly");
  }, [plan, hasYearly]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setClientSecret(null);
      setLoading(true);
      try {
        const res = await fetch("/api/billing/setup-intent", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json().catch(() => null)) as
          | { clientSecret: string }
          | { redirectUrl: string }
          | { error: string }
          | null;

        if (cancelled) return;

        if (!data) {
          setError(
            res.ok
              ? "決済準備に失敗しました"
              : `決済準備に失敗しました（HTTP ${res.status}）`,
          );
          return;
        }

        if (!res.ok) {
          if ("error" in data && typeof data.error === "string" && data.error.trim()) {
            setError(`${data.error}（HTTP ${res.status}）`);
          } else {
            setError(`決済準備に失敗しました（HTTP ${res.status}）`);
          }
          return;
        }

        if ("redirectUrl" in data) {
          window.location.href = data.redirectUrl;
          return;
        }

        if (!("clientSecret" in data)) {
          if ("error" in data && typeof data.error === "string" && data.error.trim()) {
            setError(data.error);
          } else {
            setError("決済準備に失敗しました");
          }
          return;
        }

        setClientSecret(data.clientSecret);
      } catch {
        if (!cancelled) setError("通信に失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [plan]);

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  if (!publishableKey.trim()) {
    return (
      <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-sm font-semibold text-neutral-800">Stripe設定が必要です</p>
        <p className="mt-1 text-sm text-neutral-700">
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY が未設定です。
        </p>
        <p className="mt-2 text-xs text-neutral-600">
          ローカルは .env.development.local に設定してください。
        </p>
      </div>
    );
  }

  return (
    <>
      <PlanPicker plan={plan} hasYearly={hasYearly} setPlan={setPlan} loading={loading} />

      {loading ? (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-800">決済を準備中...</p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <InnerForm plan={plan} />
        </Elements>
      ) : null}

      <p className="mt-3 text-xs text-neutral-500">
        ※決済の反映はWebhook経由なので、数秒〜数十秒かかることがあります。
      </p>
    </>
  );
}
