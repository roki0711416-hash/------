import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMockStoreById } from "@/lib/stores/mockStores";
import { getPrefectureBySlug } from "@/lib/prefectures";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

/* ── メタデータ ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const store = getMockStoreById(id);
  const title = store
    ? `${store.name}のホール分析｜スロカスくん`
    : "ホール分析｜スロカスくん";
  return {
    title,
    description: store
      ? `${store.name}（${store.city}）の活性・荒さ・還元傾向を独自分析。`
      : "パチンコ・スロットホールの傾向を独自分析。",
    alternates: { canonical: `${BASE_URL}/stores/${id}` },
  };
}

/* ── スケルトンゲージ ── */
function SkeletonGauge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium text-muted">
        {label}
      </span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="absolute inset-y-0 left-0 w-0 rounded-full bg-white/[0.1]" />
      </div>
      <span className="w-8 text-right text-xs text-white/30">—</span>
    </div>
  );
}

/* ── ページ ── */
export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // モックで検索（DB不要）
  const store = getMockStoreById(id);
  if (!store) notFound();

  const pref = getPrefectureBySlug(store.prefSlug);

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${store.prefSlug}`}
            className="hover:underline hover:text-white transition"
          >
            {pref?.name ?? store.prefSlug}
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${store.prefSlug}/stores`}
            className="hover:underline hover:text-white transition"
          >
            店舗一覧
          </Link>{" "}
          &gt; <span className="text-white/80">{store.name}</span>
        </nav>

        <h1 className="mt-3 text-xl font-black text-white">{store.name}</h1>
        <p className="mt-1 text-xs text-muted">
          {pref?.name} {store.city} {store.address}
        </p>

        {/* 準備中バッジ */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          🔧 分析データを拡充中です。しばらくお待ちください。
        </div>

        {/* スケルトンゲージ */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-white">ホール傾向分析</h2>
          <div className="mt-3 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
            <SkeletonGauge label="活性" />
            <SkeletonGauge label="荒さ" />
            <SkeletonGauge label="還元傾向" />
            <SkeletonGauge label="上振れ期待" />
          </div>
        </section>

        {/* 更新履歴（準備中） */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">更新履歴</h2>
          <p className="mt-1 text-xs text-muted">準備中</p>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
              >
                <div className="h-3 w-16 rounded bg-white/[0.06]" />
                <div className="h-3 w-24 rounded bg-white/[0.06]" />
                <div className="h-3 w-12 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/prefectures/${store.prefSlug}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            ← {pref?.name ?? "県ページ"}へ
          </Link>
          <Link
            href="/lp"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            アプリで判別する
          </Link>
        </div>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
