"use client";

import { useState } from "react";

export default function SubscribeCheckoutButton({
  showYearly = true,
}: {
  showYearly?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function goCheckout(plan: "monthly" | "yearly") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url: string }
        | { error: string }
        | null;

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok || !data || !("url" in data)) {
        setError(data && "error" in data ? data.error : `決済ページの作成に失敗しました（HTTP ${res.status}）`);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("通信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => goCheckout("monthly")}
        disabled={loading}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Checkoutへ..." : "7日間無料で始める"}
      </button>

      {showYearly ? (
        <button
          type="button"
          onClick={() => goCheckout("yearly")}
          disabled={loading}
          className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 disabled:opacity-60"
        >
          {loading ? "Checkoutへ..." : "年額で登録する（税込6,800円/年・7日間無料トライアル）"}
        </button>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
