"use client";

import { useEffect, useState } from "react";

export default function CheckoutSync({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("syncing");
      setMessage(null);
      try {
        const res = await fetch("/api/billing/sync", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json().catch(() => null)) as
          | { ok: true; synced: boolean }
          | { error: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !data || !("ok" in data)) {
          setStatus("error");
          setMessage(data && "error" in data ? data.error : `同期に失敗しました（HTTP ${res.status}）`);
          return;
        }

        setStatus("done");
        if (data.synced) {
          setMessage("会員状態を更新しました。数秒後に反映されます。");
          setTimeout(() => {
            window.location.href = "/account";
          }, 1200);
        } else {
          setMessage("購入の反映を待っています（Webhook処理中の可能性があります）。");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("通信に失敗しました");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mt-3">
      <p className="text-xs text-neutral-600">
        {status === "syncing" ? "会員状態を同期中..." : message ?? ""}
      </p>
      {status === "error" ? (
        <p className="mt-1 text-xs font-medium text-red-600">{message}</p>
      ) : null}
    </div>
  );
}
