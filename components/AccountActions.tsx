"use client";

import { useState } from "react";
import { STRIPE_PAYMENT_LINK_URL } from "../lib/stripePaymentLink";

export default function AccountActions({
  canManage,
  isPremium,
  showYearly = true,
}: {
  canManage: boolean;
  isPremium: boolean;
  showYearly?: boolean;
}) {
  void showYearly;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "checkout" | "portal" | "logout">(null);

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
          <a
            href={STRIPE_PAYMENT_LINK_URL}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white disabled:opacity-60"
          >
            2日間無料で試す（その後 月額680円）
          </a>
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
