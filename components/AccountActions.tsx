"use client";

import { useState } from "react";

export default function AccountActions({
  canManage,
  isPremium,
  showYearly = true,
}: {
  canManage: boolean;
  isPremium: boolean;
  showYearly?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "checkout" | "portal" | "logout">(null);

  async function goCheckout(plan: "monthly" | "yearly") {
    setError(null);
    setLoading("checkout");
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
        setError(data && "error" in data ? data.error : `Checkout作成に失敗しました（HTTP ${res.status}）`);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("通信に失敗しました");
    } finally {
      setLoading(null);
    }
  }

  async function goPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
      const data = (await res.json().catch(() => null)) as
        | { url: string }
        | { error: string }
        | null;

      if (!res.ok || !data || !("url" in data)) {
        setError(data && "error" in data ? data.error : "Portal作成に失敗しました");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("通信に失敗しました");
    } finally {
      setLoading(null);
    }
  }

  async function logout() {
    setError(null);
    setLoading("logout");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/account";
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {!isPremium ? (
        <>
          <button
            onClick={() => goCheckout("monthly")}
            disabled={loading !== null}
            className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading === "checkout"
              ? "Checkoutへ..."
              : "初回48時間、全機能解放"}
          </button>

          {showYearly ? (
            <button
              onClick={() => goCheckout("yearly")}
              disabled={loading !== null}
              className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 disabled:opacity-60"
            >
              {loading === "checkout"
                ? "Checkoutへ..."
                : "年額で登録する（税込6,800円/年）"}
            </button>
          ) : null}
        </>
      ) : null}

      <button
        onClick={goPortal}
        disabled={loading !== null || !canManage}
        className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 disabled:opacity-60"
      >
        {loading === "portal" ? "管理画面へ..." : isPremium ? "解約・プラン管理" : "プラン管理"}
      </button>

      <button
        onClick={logout}
        disabled={loading !== null}
        className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 disabled:opacity-60"
      >
        {loading === "logout" ? "ログアウト中..." : "ログアウト"}
      </button>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {!canManage ? (
        <p className="text-xs text-neutral-500">
          ※まだStripe customerが作成されていないため「プラン管理」は利用できません。
        </p>
      ) : null}
    </div>
  );
}
