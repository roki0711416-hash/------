"use client";

import { useState, useEffect, useCallback } from "react";

interface Store {
  id: string;
  name: string;
  prefecture: string;
  city: string | null;
  address: string | null;
}

export default function AdminStoresClient() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  // フォーム
  const [name, setName] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    const res = await fetch("/api/admin/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, prefecture, city, address }),
    });
    if (res.ok) {
      setFormMsg("追加しました");
      setName("");
      setPrefecture("");
      setCity("");
      setAddress("");
      fetchStores();
    } else {
      const data = await res.json();
      setFormMsg(`エラー: ${data.error}`);
    }
  }

  async function handleBatch() {
    setBatchRunning(true);
    setBatchResult(null);
    try {
      const res = await fetch("/api/admin/stores/batch", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBatchResult(
          `完了: ${data.stores}店舗 / ${data.signals}件のシグナルを更新 (${data.dateRange.from}〜${data.dateRange.to})`,
        );
      } else {
        setBatchResult(`エラー: ${data.error}`);
      }
    } catch (err) {
      setBatchResult(`エラー: ${err}`);
    } finally {
      setBatchRunning(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <h1 className="text-xl font-bold">店舗管理</h1>

      {/* ── バッチ実行 ── */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold">バッチ実行（モック）</h2>
        <p className="mt-1 text-xs text-neutral-500">
          直近3日分のシグナルをモックデータで生成・更新します。
        </p>
        <button
          type="button"
          onClick={handleBatch}
          disabled={batchRunning}
          className="mt-3 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {batchRunning ? "実行中..." : "バッチを実行"}
        </button>
        {batchResult && (
          <p className="mt-2 text-sm text-neutral-700">{batchResult}</p>
        )}
      </section>

      {/* ── 店舗追加 ── */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold">店舗を追加</h2>
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="店舗名 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="都道府県 * (例: 東京都)"
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="市区町村"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="住所"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
          >
            追加
          </button>
          {formMsg && <p className="text-sm text-neutral-700">{formMsg}</p>}
        </form>
      </section>

      {/* ── 店舗一覧 ── */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold">登録店舗一覧</h2>
        {loading ? (
          <p className="mt-3 text-sm text-neutral-500">読み込み中...</p>
        ) : stores.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">店舗がありません</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {stores.map((s) => (
              <li key={s.id} className="py-2">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-neutral-500">
                  {s.prefecture} {s.city ?? ""} | {s.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
