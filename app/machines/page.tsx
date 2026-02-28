import Link from "next/link";
import { getMachinesData } from "../../lib/machines";
import MachinesSearchList from "../../components/MachinesSearchList";

export const metadata = {
  title: "機種一覧 | スロカスくん",
  description:
    "メーカー別にパチスロ機種を検索できます。ジャグラー・ハナハナ・スマスロなどの機種を選び、そのまま設定判別へ進めます。",
};

export default async function MachinesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const qRaw = sp.q;
  const q = typeof qRaw === "string" ? qRaw : Array.isArray(qRaw) ? qRaw[0] : "";

  const machines = await getMachinesData();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="space-y-2">
        <h1 className="text-lg font-bold text-white">機種一覧</h1>
        <p className="text-sm text-muted">
          メーカー別に機種を探して、そのまま設定判別へ進めます。
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            ← トップ
          </Link>
          <Link
            href="/judge"
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/20"
          >
            設定判別へ
          </Link>
        </div>
      </header>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
        <h2 className="text-base font-bold text-white">カテゴリ：スマスロ</h2>
        <p className="mt-2 text-sm text-muted">スマスロの機種も対応しています（例）。</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            <Link href="/judge?machine=smart-hokuto-no-ken" className="underline underline-offset-2 hover:text-white transition">
              北斗の拳
            </Link>
          </li>
          <li>
            <Link href="/judge?machine=sankyo_karakuri" className="underline underline-offset-2 hover:text-white transition">
              からくりサーカス
            </Link>
          </li>
          <li>
            <Link href="/judge?machine=sankyo_valvrave" className="underline underline-offset-2 hover:text-white transition">
              ヴァルヴレイヴ
            </Link>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted">※実戦データ・スランプ傾向から設定推測をサポートします</p>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
        <h2 className="text-base font-bold text-white">メーカー別</h2>

        <div className="mt-4">
          <MachinesSearchList makers={machines.makers} initialQuery={q} />
        </div>
      </section>
    </main>
  );
}
