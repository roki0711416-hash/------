import Link from "next/link";
import type { Metadata } from "next";
import { PREFECTURES, getPrefecturesByRegion } from "@/lib/prefectures";
import PrefectureSearch from "@/components/PrefectureSearch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

export const metadata: Metadata = {
  title: "全国のパチンコホール分析｜スロカスくん",
  description: "都道府県別にホールの傾向を独自指標でまとめています。",
  alternates: { canonical: `${BASE_URL}/prefectures` },
};

export default function PrefecturesIndexPage() {
  const regions = getPrefecturesByRegion();

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <h1 className="text-xl font-bold">全国のパチンコホール分析</h1>
        <p className="mt-2 text-sm text-neutral-600">
          都道府県別にホールの傾向を独自指標でまとめています。
        </p>

        {/* ── 検索 ── */}
        <div className="mt-5">
          <PrefectureSearch
            prefs={PREFECTURES.map((p) => ({ slug: p.slug, name: p.name }))}
          />
        </div>

        {/* ── 地方別一覧 ── */}
        <div className="mt-8 space-y-6">
          {regions.map((group) => (
            <section key={group.region}>
              <h2 className="text-sm font-semibold text-neutral-500">
                {group.region}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.prefs.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/prefectures/${p.slug}`}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── 免責 ── */}
        <p className="mt-10 text-[10px] leading-relaxed text-neutral-400">
          ※ 本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
