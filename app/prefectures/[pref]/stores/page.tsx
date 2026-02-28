import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPrefectureBySlug, getAllPrefectureSlugs } from "@/lib/prefectures";
import { getMockStoresByPref } from "@/lib/stores/mockStores";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

/* ── 静的パス生成 ── */
export function generateStaticParams() {
  return getAllPrefectureSlugs().map((slug) => ({ pref: slug }));
}

/* ── メタデータ ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string }>;
}): Promise<Metadata> {
  const { pref } = await params;
  const p = getPrefectureBySlug(pref);
  if (!p) return {};
  return {
    title: `${p.name}の店舗一覧｜スロカスくん`,
    description: `${p.name}のパチンコ・スロットホール店舗一覧。各店舗の傾向分析を掲載。`,
    alternates: { canonical: `${BASE_URL}/prefectures/${pref}/stores` },
  };
}

/* ── ページ ── */
export default async function PrefectureStoresPage({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const prefecture = getPrefectureBySlug(pref);
  if (!prefecture) notFound();

  const stores = getMockStoresByPref(pref);

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link href={`/prefectures/${pref}`} className="hover:underline hover:text-white transition">
            {prefecture.name}
          </Link>{" "}
          &gt; <span className="text-white/80">店舗一覧</span>
        </nav>

        <h1 className="mt-3 text-xl font-black text-white">
          {prefecture.name}の店舗一覧
        </h1>
        <p className="mt-2 text-sm text-muted">
          分析は順次拡充中です。現在はサンプルデータを表示しています。
        </p>

        {/* 店舗カード */}
        <ul className="mt-6 space-y-3">
          {stores.map((s) => (
            <li key={s.id}>
              <Link
                href={`/stores/${s.id}`}
                className="block rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-xl"
              >
                <p className="text-sm font-bold text-white">{s.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {s.city} {s.address}
                </p>
                <span className="mt-2 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                  分析準備中
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
