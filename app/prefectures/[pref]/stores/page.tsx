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
        <nav className="text-xs text-neutral-400">
          <Link href="/prefectures" className="hover:underline">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link href={`/prefectures/${pref}`} className="hover:underline">
            {prefecture.name}
          </Link>{" "}
          &gt; <span className="text-neutral-700">店舗一覧</span>
        </nav>

        <h1 className="mt-3 text-xl font-bold">
          {prefecture.name}の店舗一覧
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          分析は順次拡充中です。現在はサンプルデータを表示しています。
        </p>

        {/* 店舗カード */}
        <ul className="mt-6 space-y-3">
          {stores.map((s) => (
            <li key={s.id}>
              <Link
                href={`/stores/${s.id}`}
                className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-sm"
              >
                <p className="text-sm font-bold">{s.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {s.city} {s.address}
                </p>
                <span className="mt-2 inline-block rounded bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">
                  分析準備中
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-neutral-400">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
