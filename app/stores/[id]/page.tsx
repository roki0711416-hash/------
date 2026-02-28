import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreById, getRecentSignals } from "@/lib/storeAnalytics";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreById(id);
  return {
    title: store
      ? `${store.name}の傾向分析 | スロカスくん`
      : "店舗が見つかりません",
    robots: "noindex",
  };
}

/* ── ゲージバー ── */

function IndexBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-bold text-neutral-800">
        {value}
      </span>
    </div>
  );
}

export default async function StoreDetailPage({ params }: Params) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) notFound();

  const signals = await getRecentSignals(id, 7);

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* ── ヘッダー ── */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h1 className="text-lg font-bold">{store.name}</h1>
          <p className="mt-1 text-xs text-neutral-500">
            {store.prefecture}
            {store.city ? ` ${store.city}` : ""}
          </p>
          {store.address && (
            <p className="mt-0.5 text-xs text-neutral-400">{store.address}</p>
          )}
        </section>

        {/* ── 直近シグナル ── */}
        {signals.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            まだ分析データがありません。
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {signals.map((sig) => (
              <section
                key={sig.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <h2 className="text-sm font-semibold text-neutral-700">
                  {String(sig.date)}
                </h2>

                <div className="mt-3 space-y-2">
                  <IndexBar label="活性" value={sig.traffic_index} color="bg-blue-500" />
                  <IndexBar label="荒さ" value={sig.swing_index} color="bg-orange-500" />
                  <IndexBar label="還元" value={sig.reward_index} color="bg-green-500" />
                  <IndexBar label="期待" value={sig.high_chance_index} color="bg-purple-500" />
                </div>

                {sig.note && (
                  <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                    💡 {sig.note}
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        {/* ── 免責 ── */}
        <p className="mt-6 text-[10px] leading-relaxed text-neutral-400">
          ※ 本ページは公開情報等を基にした独自集計の参考情報であり、遊技の結果を保証するものではありません。
          判断はご自身の責任でお願いいたします。
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            href={`/prefectures/${encodeURIComponent(store.prefecture)}`}
            className="text-sm text-neutral-600 underline underline-offset-2"
          >
            ← {store.prefecture}の一覧
          </Link>
          <Link
            href="/prefectures"
            className="text-sm text-neutral-600 underline underline-offset-2"
          >
            都道府県一覧
          </Link>
        </div>
      </div>
    </main>
  );
}
