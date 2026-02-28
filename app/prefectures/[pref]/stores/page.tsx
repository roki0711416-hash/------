import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPrefectureBySlug, getAllPrefectureSlugs } from "@/lib/prefectures";
import {
  listStoresByPrefecture,
  getLatestSignalForStores,
  type StoreDailySignalRow,
} from "@/lib/storeAnalytics";

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

/* ── スコアバッジ ── */
function ScoreBadge({ value, label }: { value: number; label: string }) {
  let color = "text-white/60 border-white/10 bg-white/[0.04]";
  if (value >= 70) color = "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  else if (value >= 50) color = "text-amber-300 border-amber-500/30 bg-amber-500/10";
  else if (value >= 30) color = "text-white/60 border-white/10 bg-white/[0.04]";
  else color = "text-white/30 border-white/[0.06] bg-white/[0.02]";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {label} {value}
    </span>
  );
}

function SignalBadges({ sig }: { sig: StoreDailySignalRow | undefined }) {
  if (!sig) {
    return (
      <span className="inline-block rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/30">
        データなし
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      <ScoreBadge value={sig.reward_index} label="還元" />
      <ScoreBadge value={sig.traffic_index} label="活性" />
      <ScoreBadge value={sig.swing_index} label="荒さ" />
      <ScoreBadge value={sig.high_chance_index} label="上振" />
    </div>
  );
}

/* ── ページ ── */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function PrefectureStoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ pref: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { pref } = await params;
  const sp = await searchParams;
  const prefecture = getPrefectureBySlug(pref);
  if (!prefecture) notFound();

  const search = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { stores, total } = await listStoresByPrefecture(pref, {
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const signalMap = stores.length > 0
    ? await getLatestSignalForStores(stores.map((s) => s.id))
    : new Map<string, StoreDailySignalRow>();

  function pageUrl(p: number) {
    const u = new URLSearchParams();
    if (search) u.set("q", search);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return `/prefectures/${pref}/stores${qs ? `?${qs}` : ""}`;
  }

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
          {total}店舗{search ? `（「${search}」で絞り込み）` : ""}
        </p>

        {/* 検索ボックス */}
        <form method="GET" className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="店舗名で検索..."
              className="flex-1 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.08] transition"
            />
            <button
              type="submit"
              className="rounded-xl bg-white/[0.1] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.18]"
            >
              検索
            </button>
          </div>
        </form>

        {/* 店舗カード */}
        {total === 0 ? (
          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-6 text-center">
            <p className="text-sm text-amber-300">
              {search ? `「${search}」に一致する店舗がありません` : "店舗データがまだありません"}
            </p>
            <p className="mt-1 text-xs text-amber-300/60">
              {search ? "検索条件を変えてお試しください" : "CSVインポートで店舗を追加してください"}
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {stores.map((s) => {
                const sig = signalMap.get(s.id);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/stores/${s.id}`}
                      className="block rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-xl"
                    >
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {s.city} {s.address}
                      </p>
                      <div className="mt-2">
                        <SignalBadges sig={sig} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ページネーション */}
            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={pageUrl(page - 1)}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.1]"
                  >
                    ← 前へ
                  </Link>
                )}
                <span className="text-xs text-muted">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={pageUrl(page + 1)}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.1]"
                  >
                    次へ →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
