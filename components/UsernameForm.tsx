"use client";

import { useState } from "react";

export default function UsernameForm({
  initialUsername,
}: {
  initialUsername: string | null;
}) {
  const [username, setUsername] = useState(initialUsername ?? "");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);

    try {
      const res = await fetch("/api/account/username", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { error: string }
        | null;

      if (!res.ok) {
        setError(data && "error" in data ? data.error : "更新に失敗しました");
        return;
      }

      setOk(true);
      // サーバー側表示を更新するため
      window.location.reload();
    } catch {
      setError("通信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <label className="block">
        <span className="text-xs font-semibold text-neutral-600">ユーザーネーム</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          placeholder="20文字以内・空白なし"
          maxLength={20}
          required
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm font-medium text-neutral-700">更新しました。</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "更新中..." : "ユーザーネームを設定する"}
      </button>
    </form>
  );
}
