import Link from "next/link";
import Image from "next/image";
import { getPlayByShareToken } from "../../../lib/plays";

export const metadata = {
  title: "共有 | スロット設定判別ツール",
};

function yen(v: number | null): string {
  if (v === null) return "-";
  return `${v.toLocaleString()}円`;
}

export default async function SharedPlayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const play = await getPlayByShareToken(token);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">当日データ（共有）</h1>

        {!play ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-700">データが見つかりません。</p>
            <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
              ← トップへ戻る
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">
                {play.playedOn} / {play.machineName}
                {play.machineNo !== null ? `（台番${play.machineNo}）` : ""}
                {play.storeName ? `（${play.storeName}）` : ""}
              </p>
              <p className="mt-2 text-sm text-neutral-700">
                投資: {yen(play.investYen)} / 回収: {yen(play.returnYen)}
                {play.investYen !== null && play.returnYen !== null
                  ? `（差: ${(play.returnYen - play.investYen).toLocaleString()}円）`
                  : ""}
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                総G: {play.totalGames ?? "-"} / BIG: {play.bigCount ?? "-"} / REG: {play.regCount ?? "-"} / 差枚: {play.diffCoins ?? "-"}
              </p>
            </div>

            {play.memo ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-semibold">メモ</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{play.memo}</p>
              </div>
            ) : null}

            {play.imageUrl ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-sm font-semibold">画像</p>
                <Image
                  src={play.imageUrl}
                  alt="共有画像"
                  width={1200}
                  height={800}
                  unoptimized
                  className="mt-2 h-auto w-full rounded-xl border border-neutral-200 bg-white"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
                ← トップへ
              </Link>
              <Link href="/account" className="text-sm text-neutral-700 underline underline-offset-2">
                サブスク
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
