import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPrefectureBySlug,
  getAllPrefectureSlugs,
} from "@/lib/prefectures";

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
    title: `${p.name}のパチンコホール分析｜スロカスくん`,
    description: `${p.name}のパチンコ・スロットホールの傾向を独自指標で分析。`,
    alternates: { canonical: `${BASE_URL}/prefectures/${pref}` },
  };
}

/* ── ページ ── */
export default async function PrefecturePage({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const prefecture = getPrefectureBySlug(pref);
  if (!prefecture) notFound();

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt; <span className="text-white/80">{prefecture.name}</span>
        </nav>

        <h1 className="mt-3 text-xl font-black text-white">
          {prefecture.name}のパチンコホール分析
        </h1>
        <p className="mt-2 text-sm text-muted">
          {prefecture.name}
          のホール傾向を独自指標で分析しています。データは順次拡充中です。
        </p>

        {/* 店舗一覧へ */}
        <div className="mt-6">
          <Link
            href={`/prefectures/${pref}/stores`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/35 active:scale-[0.98]"
          >
            店舗一覧を見る →
          </Link>
        </div>

        {/* 県内ランキング（準備中） */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">県内ランキング</h2>
          <p className="mt-1 text-xs text-muted">準備中</p>
          <div className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/40">
                  {i}
                </span>
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-white/[0.06]" />
                  <div className="mt-1 h-3 w-20 rounded bg-white/[0.06]" />
                </div>
                <div className="h-6 w-16 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </section>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
