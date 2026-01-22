import Link from "next/link";
import { getMachinesData } from "../../lib/machines";
import MachinesSearchList from "../../components/MachinesSearchList";

export const metadata = {
  title: "機種一覧 | スロカスくん",
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
        <h1 className="text-lg font-semibold">機種一覧</h1>
        <p className="text-sm text-neutral-600">
          メーカー別に機種を探して、そのまま設定判別へ進めます。
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900"
          >
            ← トップ
          </Link>
          <Link
            href="/judge"
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            設定判別へ
          </Link>
        </div>
      </header>

      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold">カテゴリ：スマスロ</h2>
        <p className="mt-2 text-sm text-neutral-700">スマスロの機種も対応しています（例）。</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
          <li>
            <Link href="/judge?machine=smart-hokuto-no-ken" className="underline underline-offset-2">
              北斗の拳
            </Link>
          </li>
          <li>
            <Link href="/judge?machine=sankyo_karakuri" className="underline underline-offset-2">
              からくりサーカス
            </Link>
          </li>
          <li>
            <Link href="/judge?machine=sankyo_valvrave" className="underline underline-offset-2">
              ヴァルヴレイヴ
            </Link>
          </li>
        </ul>
        <p className="mt-2 text-xs text-neutral-600">※実戦データ・スランプ傾向から設定推測をサポートします</p>
      </section>

      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold">メーカー別</h2>

        <div className="mt-4">
          <MachinesSearchList makers={machines.makers} initialQuery={q} />
        </div>
      </section>
    </main>
  );
}
