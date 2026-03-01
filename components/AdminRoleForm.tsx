"use client";

import { useState } from "react";

type Role = "user" | "dev" | "admin";

export default function AdminRoleForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setOk(null);

    const e = email.trim();
    if (!e || !e.includes("@")) {
      setError("メールアドレスが不正です");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: e, role }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true; updated: number }
        | { error: string }
        | null;

      if (!res.ok) {
        setError(data && "error" in data ? data.error : `更新に失敗しました（HTTP ${res.status}）`);
        return;
      }

      setOk("更新しました");
    } catch {
      setError("通信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
      <p className="text-sm font-semibold text-white">管理者：ユーザー権限の更新</p>
      <p className="mt-1 text-xs text-muted">メールアドレスで指定して role を設定します。</p>

      <div className="mt-3 space-y-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="target@example.com"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm"
        >
          <option value="user">user（一般）</option>
          <option value="dev">dev</option>
          <option value="admin">admin（会員機能を常に解放）</option>
        </select>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "更新中..." : "更新する"}
        </button>

        {ok ? <p className="text-sm font-medium text-white">{ok}</p> : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
