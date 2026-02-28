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
      <span className="w-20 text-xs font-medium text-neutral-500">
        {label}
      </span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div className="absolute inset-y-0 left-0 w-0 rounded-full bg-neutral-200" />
      </div>
      <span className="w-8 text-right text-xs text-neutral-300">—</span>
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
        <nav className="text-xs text-neutral-400">
          <Link href="/prefectures" className="hover:underline">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${store.prefSlug}`}
            className="hover:underline"
          >
            {pref?.name ?? store.prefSlug}
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${store.prefSlug}/stores`}
            className="hover:underline"
          >
            店舗一覧
          </Link>{" "}
          &gt; <span className="text-neutral-700">{store.name}</span>
        </nav>

        <h1 className="mt-3 text-xl font-bold">{store.name}</h1>
        <p className="mt-1 text-xs text-neutral-500">
          {pref?.name} {store.city} {store.address}
        </p>

        {/* 準備中バッジ */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          🔧 分析データを拡充中です。しばらくお待ちください。
        </div>

        {/* スケルトンゲージ */}
        <section className="mt-6">
          <h2 className="text-base font-semibold">ホール傾向分析</h2>
          <div className="mt-3 space-y-3 rounded-lg border border-neutral-100 bg-white p-4">
            <SkeletonGauge label="活性" />
            <SkeletonGauge label="荒さ" />
            <SkeletonGauge label="還元傾向" />
            <SkeletonGauge label="上振れ期待" />
          </div>
        </section>

        {/* 更新履歴（準備中） */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">更新履歴</h2>
          <p className="mt-1 text-xs text-neutral-400">準備中</p>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded border border-neutral-100 bg-white px-3 py-2"
              >
                <div className="h-3 w-16 rounded bg-neutral-100" />
                <div className="h-3 w-24 rounded bg-neutral-100" />
                <div className="h-3 w-12 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        </section>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-neutral-400">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
