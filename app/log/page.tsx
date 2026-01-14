import Link from "next/link";
import { getMachinesData } from "../../lib/machines";
import { getSiteUrl } from "../../lib/site";
import { getViewer } from "../../lib/auth";
import { listPlaysForUser } from "../../lib/plays";

export const metadata = {
  title: "収支・当日データ | スロット設定判別ツール",
};

function todayYmd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yen(v: number | null): string {
  if (v === null) return "-";
  return `${v.toLocaleString()}円`;
}

function firstString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return monthKey;
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + delta);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

export default async function LogPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const ok = sp.ok === "1";
  const error = sp.error === "invalid";
  const missingTable = sp.error === "missing_table";
  const dbMissing = sp.error === "db_missing";
  const invalidUser = sp.error === "invalid_user";

  const month =
    firstString(sp.month) ??
    todayYmd().slice(0, 7);

  const selectedDate = firstString(sp.date) ?? todayYmd();

  const viewer = await getViewer();
  const siteUrl = getSiteUrl();

  const machines = await getMachinesData();
  const isPremium = !!viewer?.premium;

  const plays = isPremium && viewer ? await listPlaysForUser(viewer.userId, 200) : [];
  const monthPrefix = `${month}-`;
  const monthPlays = plays.filter((p) => p.playedOn.startsWith(monthPrefix));

  const byDate = new Map<string, typeof monthPlays>();
  for (const p of monthPlays) {
    const list = byDate.get(p.playedOn) ?? [];
    list.push(p);
    byDate.set(p.playedOn, list);
  }

  const [monthYear, monthNo] = month.split("-").map((x) => Number(x));
  const validMonth = Number.isFinite(monthYear) && Number.isFinite(monthNo) && monthNo >= 1 && monthNo <= 12;
  const dim = validMonth ? daysInMonth(monthYear, monthNo) : 30;
  const firstDow = validMonth ? new Date(monthYear, monthNo - 1, 1).getDay() : 0; // 0=Sun

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">収支・当日データ</h1>
          <Link
            href="/tool"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
          >
            ツールへ
          </Link>
        </div>

        <p className="mt-2 text-sm text-neutral-600">
          台ごとに、当日のデータ（総G/BIG/REG/差枚/投資/回収/メモ/画像）を保存できます。共有リンクは匿名で閲覧できます。
        </p>

        {ok ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            保存しました。
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            入力に不備があります。
          </p>
        ) : null}
        {missingTable ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            DBの初期化がまだです。`npm run db:init-auth` を実行してから再度お試しください。
          </p>
        ) : null}
        {dbMissing ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            DB接続が未設定です。.env.local に DATABASE_URL（または POSTGRES_URL）を設定してから `npm run db:init-auth` を実行してください。
          </p>
        ) : null}
        {invalidUser ? (
          <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            デモ用ユーザーIDが不正でした。開発サーバを再起動して再度お試しください。
          </p>
        ) : null}

        {!viewer ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-700">ログインが必要です。</p>
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
            >
              ログイン
            </Link>
          </div>
        ) : !isPremium ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm font-semibold">サブスク限定（プレビュー）</p>
            <p className="mt-1 text-xs text-neutral-600">
              加入すると、保存・一覧・削除ができます。共有リンクは匿名で見れます。
            </p>

            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="grid gap-2 text-sm text-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">台</span>
                  <span className="blur-sm select-none font-semibold">スマスロ◯◯（メーカー）</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">投資 / 回収</span>
                  <span className="blur-sm select-none font-semibold">12,000円 / 18,000円</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">共有リンク</span>
                  <span className="blur-sm select-none font-semibold">{siteUrl}/s/xxxxxxxx</span>
                </div>
              </div>
            </div>

            <Link
              href="/account"
              className="mt-3 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              購読して使う
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-sm font-semibold">新規保存</p>

              <form id="new" action="/api/plays/create" method="post" className="mt-3 space-y-3">
                <input type="hidden" name="returnMonth" value={month} />
                <div>
                  <p className="text-xs font-semibold text-neutral-600">台</p>
                  <select
                    name="machineId"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      選択してください
                    </option>
                    {machines.makers.map((maker) => (
                      <optgroup key={maker.name} label={maker.name}>
                        {maker.machines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">日付</p>
                    <input
                      type="date"
                      name="playedOn"
                      defaultValue={selectedDate}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">台番（任意）</p>
                    <input
                      inputMode="numeric"
                      name="machineNo"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 123"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">店舗（任意）</p>
                    <input
                      name="storeName"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 〇〇店"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">総G</p>
                    <input
                      inputMode="numeric"
                      name="totalGames"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 2500"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">BIG</p>
                    <input
                      inputMode="numeric"
                      name="bigCount"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 12"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">REG</p>
                    <input
                      inputMode="numeric"
                      name="regCount"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">差枚（枚）</p>
                    <input
                      inputMode="numeric"
                      name="diffCoins"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: +1200"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">投資（円）</p>
                    <input
                      inputMode="numeric"
                      name="investYen"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 12000"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-600">回収（円）</p>
                    <input
                      inputMode="numeric"
                      name="returnYen"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例: 18000"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-600">メモ（任意）</p>
                  <textarea
                    name="memo"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    placeholder="例: 朝イチは弱め、夕方から当たりが軽い"
                    rows={3}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-600">画像（任意）</p>
                  <input
                    name="imageUrl"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    placeholder="画像URL または data:... を貼り付け"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    ※まずはURL貼り付け対応（アップロード対応は後で追加できます）
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  保存
                </button>
              </form>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">カレンダー</p>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/log?month=${addMonths(month, -1)}`}
                    className="text-neutral-700 underline underline-offset-2"
                  >
                    ←
                  </Link>
                  <span className="font-semibold text-neutral-900">{month}</span>
                  <Link
                    href={`/log?month=${addMonths(month, 1)}`}
                    className="text-neutral-700 underline underline-offset-2"
                  >
                    →
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2 rounded-xl border border-neutral-200 bg-white p-3">
                {Array.from({ length: firstDow }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-16 rounded-lg bg-neutral-50" />
                ))}
                {Array.from({ length: dim }).map((_, i) => {
                  const day = i + 1;
                  const dd = String(day).padStart(2, "0");
                  const ymd = validMonth ? `${month}-${dd}` : "";
                  const dayPlays = ymd ? byDate.get(ymd) ?? [] : [];
                  let sumDiff: number | null = null;
                  for (const p of dayPlays) {
                    if (p.investYen !== null && p.returnYen !== null) {
                      sumDiff = (sumDiff ?? 0) + (p.returnYen - p.investYen);
                    }
                  }

                  const href = !ymd ? undefined : `/log?month=${month}&date=${ymd}#new`;

                  return (
                    <a
                      key={ymd || String(day)}
                      href={href}
                      className="h-16 rounded-lg border border-neutral-200 bg-white p-2 text-left"
                    >
                      <p className="text-xs font-semibold text-neutral-900">{day}</p>
                      {dayPlays.length ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[11px] text-neutral-600">{dayPlays.length}件</p>
                          <p className="text-[11px] text-neutral-600">
                            差: {sumDiff === null ? "-" : `${sumDiff.toLocaleString()}円`}
                          </p>
                        </div>
                      ) : null}
                    </a>
                  );
                })}
              </div>

              <p className="mt-5 text-sm font-semibold">履歴（{month}）</p>

              {monthPlays.length ? (
                <div className="mt-3 space-y-3">
                  {Array.from(byDate.entries())
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, list]) => (
                      <div key={date} id={`d-${date}`} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-sm font-semibold text-neutral-900">{date}</p>
                        <div className="mt-2 space-y-3">
                          {list.map((p) => {
                            const shareUrl = `${siteUrl}/s/${p.shareToken}`;
                            const diffYen =
                              p.investYen !== null && p.returnYen !== null
                                ? p.returnYen - p.investYen
                                : null;

                            return (
                              <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                                <p className="text-sm font-semibold text-neutral-900">
                                  {p.machineName}
                                  {p.machineNo !== null ? `（台番${p.machineNo}）` : ""}
                                  {p.storeName ? `（${p.storeName}）` : ""}
                                </p>

                                <div className="mt-2 grid gap-1 text-sm text-neutral-700">
                                  <p>
                                    投資: {yen(p.investYen)} / 回収: {yen(p.returnYen)}
                                    {diffYen !== null ? `（差: ${diffYen.toLocaleString()}円）` : ""}
                                  </p>
                                  <p>
                                    総G: {p.totalGames ?? "-"} / BIG: {p.bigCount ?? "-"} / REG: {p.regCount ?? "-"} / 差枚: {p.diffCoins ?? "-"}
                                  </p>
                                </div>

                                {p.memo ? (
                                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{p.memo}</p>
                                ) : null}

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <a
                                    href={shareUrl}
                                    className="text-sm text-neutral-700 underline underline-offset-2"
                                  >
                                    共有リンク（匿名）
                                  </a>
                                  <form action="/api/plays/delete" method="post">
                                    <input type="hidden" name="playId" value={p.id} />
                                    <input type="hidden" name="returnMonth" value={month} />
                                    <input type="hidden" name="returnDate" value={p.playedOn} />
                                    <button
                                      type="submit"
                                      className="text-sm text-neutral-700 underline underline-offset-2"
                                    >
                                      削除
                                    </button>
                                  </form>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">この月はまだ保存がありません。</p>
              )}
            </div>
          </>
        )}
      </section>

      <div className="mt-6">
        <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
