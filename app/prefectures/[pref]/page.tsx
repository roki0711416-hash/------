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
        <nav className="text-xs text-neutral-400">
          <Link href="/prefectures" className="hover:underline">
            全国
          </Link>{" "}
          &gt; <span className="text-neutral-700">{prefecture.name}</span>
        </nav>

        <h1 className="mt-3 text-xl font-bold">
          {prefecture.name}のパチンコホール分析
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {prefecture.name}
          のホール傾向を独自指標で分析しています。データは順次拡充中です。
        </p>

        {/* 店舗一覧へ */}
        <div className="mt-6">
          <Link
            href={`/prefectures/${pref}/stores`}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            店舗一覧を見る →
          </Link>
        </div>

        {/* 県内ランキング（準備中） */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">県内ランキング</h2>
          <p className="mt-1 text-xs text-neutral-400">準備中</p>
          <div className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white p-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-400">
                  {i}
                </span>
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-neutral-100" />
                  <div className="mt-1 h-3 w-20 rounded bg-neutral-100" />
                </div>
                <div className="h-6 w-16 rounded bg-neutral-100" />
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
