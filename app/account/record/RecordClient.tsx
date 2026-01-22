"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createDummyDbRecordStorage,
  createLocalStorageRecordStorage,
  type RecordStorage,
} from "./recordStorage";

// YYYY-MM-DD
export type ISODate = `${number}-${string}-${string}`;

export type SlotSession = {
  id: string;
  date: ISODate;
  machineName: string;
  games: number;
  bigCount?: number;
  regCount?: number;
  guessedSetting?: number | null;
  machineNumber?: string;
  shopName?: string;
  diffCoins: number;
  invest: number;
  collect: number;
  judgeResultId?: string | null;
};

export type RecordSessionsByDate = Record<ISODate, SlotSession[]>;

type CalendarCell = {
  key: string;
  date: Date;
  inMonth: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseISODateToDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (!Number.isFinite(d.getTime())) return null;
  // Guard against Date parsing quirks.
  if (toISODate(d) !== iso) return null;
  return d;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function formatMonthTitle(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function safeInt(input: string) {
  const n = Number.parseInt(input, 10);
  return Number.isFinite(n) ? n : 0;
}

function isNonNegativeIntString(input: string) {
  return /^\d*$/.test(input);
}

function parseNonNegativeIntOrZero(input: string) {
  if (input.trim() === "") return 0;
  return safeInt(input);
}

function parseNonNegativeIntOrNull(input: string) {
  if (input.trim() === "") return null;
  const n = safeInt(input);
  return n >= 0 ? n : null;
}

function parseGuessedSetting(input: string) {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n)) return null;
  if (n < 1 || n > 6) return null;
  return n;
}

function formatSignedYen(n: number) {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("ja-JP").format(abs);
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted}`;
  return "0";
}

function formatSignedNumber(n: number) {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("ja-JP").format(abs);
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted}`;
  return "0";
}

function calcProfit(invest: number, collect: number) {
  return collect - invest;
}

function sumDayProfit(sessions: SlotSession[] | undefined) {
  if (!sessions || sessions.length === 0) return 0;
  return sessions.reduce((acc, s) => acc + calcProfit(s.invest, s.collect), 0);
}

export default function RecordClient({
  isLoggedIn,
  userId,
}: {
  isLoggedIn: boolean;
  userId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefill = useMemo(() => {
    const dateParam = searchParams.get("date");
    const machineNameParam = searchParams.get("machineName");
    const gamesParam = searchParams.get("games");
    const bigCountParam = searchParams.get("bigCount");
    const regCountParam = searchParams.get("regCount");
    const guessedSettingParam = searchParams.get("guessedSetting");
    const judgeResultIdParam = searchParams.get("judgeResultId");

    const date =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;
    const dateOrToday = date ?? toISODate(new Date());
    const monthBase = parseISODateToDate(dateOrToday) ?? new Date();
    const machineName = machineNameParam ?? "";
    const shouldOpen = Boolean(dateParam || machineNameParam || judgeResultIdParam);

    const games = gamesParam && /^\d+$/.test(gamesParam) ? gamesParam : "0";

    const bigCount = bigCountParam && /^\d+$/.test(bigCountParam) ? bigCountParam : "";
    const regCount = regCountParam && /^\d+$/.test(regCountParam) ? regCountParam : "";
    const guessedSettingRaw = guessedSettingParam && /^\d+$/.test(guessedSettingParam) ? guessedSettingParam : "";
    const guessedSettingNum = guessedSettingRaw ? Number(guessedSettingRaw) : null;
    const guessedSetting =
      guessedSettingNum && Number.isInteger(guessedSettingNum) && guessedSettingNum >= 1 && guessedSettingNum <= 6
        ? guessedSettingRaw
        : "";

    const judgeResultId =
      judgeResultIdParam && judgeResultIdParam.trim().length > 0 ? judgeResultIdParam : null;

    return {
      date: dateOrToday,
      machineName,
      games,
      bigCount,
      regCount,
      guessedSetting,
      monthBase,
      shouldOpen,
      judgeResultId,
    };
  }, [searchParams]);

  const guestStorage = useMemo<RecordStorage>(() => {
    return createLocalStorageRecordStorage("slokasu.record.guest.v1");
  }, []);

  const activeStorage = useMemo<RecordStorage>(() => {
    if (!isLoggedIn) return guestStorage;
    return createDummyDbRecordStorage(userId ?? "anonymous");
  }, [guestStorage, isLoggedIn, userId]);

  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(prefill.monthBase));
  const [recordsByDate, setRecordsByDate] = useState<RecordSessionsByDate>(() => activeStorage.load());

  const [isModalOpen, setIsModalOpen] = useState(prefill.shouldOpen);
  const [modalDate, setModalDate] = useState<string>(prefill.date);
  const [modalMachineName, setModalMachineName] = useState<string>(prefill.machineName);
  const [modalGames, setModalGames] = useState<string>(prefill.games);
  const [modalBigCount, setModalBigCount] = useState<string>(prefill.bigCount);
  const [modalRegCount, setModalRegCount] = useState<string>(prefill.regCount);
  const [modalGuessedSetting, setModalGuessedSetting] = useState<string>(prefill.guessedSetting);
    const [modalMachineNumber, setModalMachineNumber] = useState<string>("");
    const [modalShopName, setModalShopName] = useState<string>("");
  const [modalDiffCoins, setModalDiffCoins] = useState<string>("0");
  const [modalInvest, setModalInvest] = useState<string>("0");
  const [modalCollect, setModalCollect] = useState<string>("0");
  const [modalJudgeResultId, setModalJudgeResultId] = useState<string | null>(prefill.judgeResultId);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const modalValidation = useMemo(() => {
    const fieldErrors: Partial<
      Record<
        | "date"
        | "machineName"
        | "games"
        | "bigCount"
        | "regCount"
        | "guessedSetting"
        | "diffCoins"
        | "invest"
        | "collect",
        string
      >
    > = {};

    const date = modalDate.trim();
    if (!date) fieldErrors.date = "日付は必須です";

    const machineName = modalMachineName.trim();
    if (!machineName) fieldErrors.machineName = "機種名は必須です";

    if (!isNonNegativeIntString(modalGames)) fieldErrors.games = "G数は0以上の整数で入力してください";
    if (!isNonNegativeIntString(modalBigCount)) fieldErrors.bigCount = "BIGは0以上の整数で入力してください";
    if (!isNonNegativeIntString(modalRegCount)) fieldErrors.regCount = "REGは0以上の整数で入力してください";
    if (modalGuessedSetting.trim() !== "" && parseGuessedSetting(modalGuessedSetting) === null) {
      fieldErrors.guessedSetting = "推測設定は1〜6で入力してください";
    }
    if (!isNonNegativeIntString(modalDiffCoins)) fieldErrors.diffCoins = "差枚は0以上の整数で入力してください";
    if (!isNonNegativeIntString(modalInvest)) fieldErrors.invest = "投資は0以上の整数で入力してください";
    if (!isNonNegativeIntString(modalCollect)) fieldErrors.collect = "回収は0以上の整数で入力してください";

    const parsed = {
      date: date as ISODate,
      machineName,
      games: parseNonNegativeIntOrZero(modalGames),
      bigCount: parseNonNegativeIntOrNull(modalBigCount),
      regCount: parseNonNegativeIntOrNull(modalRegCount),
      guessedSetting: parseGuessedSetting(modalGuessedSetting),
      machineNumber: modalMachineNumber.trim(),
      shopName: modalShopName.trim(),
      diffCoins: parseNonNegativeIntOrZero(modalDiffCoins),
      invest: parseNonNegativeIntOrZero(modalInvest),
      collect: parseNonNegativeIntOrZero(modalCollect),
    };

    const isValid = Object.keys(fieldErrors).length === 0;
    return { isValid, fieldErrors, parsed };
  }, [
    modalBigCount,
    modalCollect,
    modalDate,
    modalDiffCoins,
    modalGames,
    modalGuessedSetting,
    modalInvest,
    modalMachineName,
    modalMachineNumber,
    modalRegCount,
    modalShopName,
  ]);

  const modalProfit = useMemo(() => {
    return calcProfit(modalValidation.parsed.invest, modalValidation.parsed.collect);
  }, [modalValidation.parsed.collect, modalValidation.parsed.invest]);

  const sessionsForModalDate = useMemo(() => {
    const date = modalDate as ISODate;
    return recordsByDate[date] ?? [];
  }, [modalDate, recordsByDate]);

  const modalDayTotals = useMemo(() => {
    const profitTotal = sessionsForModalDate.reduce((acc, s) => acc + calcProfit(s.invest, s.collect), 0);
    const diffCoinsTotal = sessionsForModalDate.reduce((acc, s) => acc + s.diffCoins, 0);
    return { profitTotal, diffCoinsTotal };
  }, [sessionsForModalDate]);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const first = startOfMonth(cursorMonth);
    const firstDow = first.getDay(); // 0..6 (Sun..Sat)
    const start = new Date(first);
    start.setDate(first.getDate() - firstDow);

    const cells: CalendarCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const inMonth = date.getMonth() === cursorMonth.getMonth();
      cells.push({ key: toISODate(date), date, inMonth });
    }

    return cells;
  }, [cursorMonth]);

  function openForDate(d: Date) {
    const iso = toISODate(d);

    setModalDate(iso);
    setModalMachineName("");
    setModalGames("0");
    setModalBigCount("");
    setModalRegCount("");
    setModalGuessedSetting("");
    setModalMachineNumber("");
    setModalShopName("");
    setModalDiffCoins("0");
    setModalInvest("0");
    setModalCollect("0");
    setModalJudgeResultId(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function updateRecords(updater: (prev: RecordSessionsByDate) => RecordSessionsByDate) {
    setRecordsByDate((prev) => {
      const next = updater(prev);
      activeStorage.save(next);
      return next;
    });
  }

  async function saveModal() {
    if (!modalValidation.isValid) return;

    const date = modalValidation.parsed.date;
    const session: SlotSession = {
      id: globalThis.crypto?.randomUUID?.() ?? `${date}-${Date.now()}`,
      date,
      machineName: modalValidation.parsed.machineName,
      games: modalValidation.parsed.games,
      bigCount: modalValidation.parsed.bigCount ?? undefined,
      regCount: modalValidation.parsed.regCount ?? undefined,
      guessedSetting: modalValidation.parsed.guessedSetting,
      machineNumber: modalValidation.parsed.machineNumber || undefined,
      shopName: modalValidation.parsed.shopName || undefined,
      diffCoins: modalValidation.parsed.diffCoins,
      invest: modalValidation.parsed.invest,
      collect: modalValidation.parsed.collect,
      judgeResultId: modalJudgeResultId,
    };

    updateRecords((prev) => {
      const nextDaySessions = [...(prev[date] ?? []), session];
      return {
        ...prev,
        [date]: nextDaySessions,
      };
    });

    // DB連携（ゲストでも可 / user_idはサーバー側でnullable）
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          machineName: session.machineName,
          games: session.games,
          bigCount: session.bigCount ?? null,
          regCount: session.regCount ?? null,
          guessedSetting: session.guessedSetting ?? null,
          machineNumber: session.machineNumber ?? "",
          shopName: session.shopName ?? "",
          diffCoins: session.diffCoins,
          invest: session.invest,
          collect: session.collect,
          judgeResultId: session.judgeResultId ?? null,
        }),
      });

      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        setToastMessage("保存しました");
        // 判別からのqueryを消して、リロードで再登録が起きないようにする
        router.replace(pathname);
      }
    } catch {
      // ローカル保存は成功しているため、ここでは何もしない
    }

    setIsModalOpen(false);
  }

  function deleteSession(date: ISODate, sessionId: string) {
    updateRecords((prev) => {
      const daySessions = prev[date] ?? [];
      const nextDaySessions = daySessions.filter((s) => s.id !== sessionId);
      if (nextDaySessions.length === 0) {
        const next: RecordSessionsByDate = { ...prev };
        delete next[date];
        return next;
      }
      return {
        ...prev,
        [date]: nextDaySessions,
      };
    });
  }

  function syncFromDevice() {
    if (!isLoggedIn) return;
    const imported = guestStorage.load();
    updateRecords((prev) => {
      const next: RecordSessionsByDate = { ...prev };
      for (const [date, sessions] of Object.entries(imported)) {
        const d = date as ISODate;
        next[d] = [...(next[d] ?? []), ...sessions];
      }
      return next;
    });
  }

  const isJudgePrefill = Boolean(modalJudgeResultId);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">収支管理</h1>
        <p className="mt-1 text-sm text-neutral-700">日付をクリックして実戦データを追加します。</p>

        {!isLoggedIn ? (
          <p className="mt-2 text-xs text-neutral-600">
            ログインなしの場合、データはこの端末に保存されます。端末変更やブラウザ削除で消える可能性があります
          </p>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ログイン中</p>
            <button
              type="button"
              onClick={syncFromDevice}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
            >
              データを同期（取り込み）
            </button>
          </div>
        )}
      </header>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCursorMonth((m) => addMonths(m, -1))}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
          >
            前月
          </button>

          <h2 className="text-base font-semibold text-neutral-900">{formatMonthTitle(cursorMonth)}</h2>

          <button
            type="button"
            onClick={() => setCursorMonth((m) => addMonths(m, 1))}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
          >
            翌月
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-neutral-700">
          <div>日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div>土</div>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            const iso = toISODate(cell.date);
            const sessions = recordsByDate[iso as ISODate];
            const hasAny = Boolean(sessions && sessions.length > 0);
            const dayProfit = hasAny ? sumDayProfit(sessions) : null;

            const profitText = dayProfit === null ? "" : formatSignedYen(dayProfit);
            const profitClass =
              dayProfit === null ? "" : dayProfit < 0 ? "text-red-600" : "text-neutral-900";

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => openForDate(cell.date)}
                className={
                  "rounded-xl border border-neutral-200 bg-white px-2 py-2 text-left " +
                  (cell.inMonth ? "" : "opacity-50")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{cell.date.getDate()}</span>
                </div>
                <div className={`mt-1 text-xs font-semibold ${profitClass}`}>{profitText}</div>
              </button>
            );
          })}
        </div>
      </section>

      {isModalOpen ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto px-4 py-6">
          <button
            type="button"
            aria-label="閉じる"
            className="fixed inset-0 z-0 bg-neutral-900/40"
            onClick={closeModal}
          />

          <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">収支入力</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
              >
                閉じる
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-900">この日の合計</p>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                <p className="text-neutral-700">差枚</p>
                <p className="font-semibold text-neutral-900">{formatSignedNumber(modalDayTotals.diffCoinsTotal)}</p>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                <p className="text-neutral-700">収支</p>
                <p className={"font-semibold " + (modalDayTotals.profitTotal < 0 ? "text-red-600" : "text-neutral-900")}>
                  {formatSignedYen(modalDayTotals.profitTotal)}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
              <p className="text-sm font-semibold text-neutral-900">この日のセッション</p>
              {sessionsForModalDate.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-700">まだ登録がありません。</p>
              ) : (
                <div className="mt-2">
                  <div className="grid grid-cols-12 gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700">
                    <div className="col-span-4">機種</div>
                    <div className="col-span-2 text-right">G</div>
                    <div className="col-span-2 text-right">差枚</div>
                    <div className="col-span-2 text-right">収支</div>
                    <div className="col-span-2 text-right">操作</div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {sessionsForModalDate.map((s) => {
                      const profit = calcProfit(s.invest, s.collect);
                      return (
                        <div key={s.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                          <div className="grid grid-cols-12 items-start gap-2">
                            <div className="col-span-4 min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-900">{s.machineName}</p>
                              <p className="mt-1 text-[11px] text-neutral-700">
                                投資 {new Intl.NumberFormat("ja-JP").format(s.invest)} / 回収 {new Intl.NumberFormat("ja-JP").format(s.collect)}
                              </p>
                            </div>

                            <div className="col-span-2 text-right">
                              <p className="text-sm font-semibold text-neutral-900">{new Intl.NumberFormat("ja-JP").format(s.games)}</p>
                            </div>

                            <div className="col-span-2 text-right">
                              <p className="text-sm font-semibold text-neutral-900">{formatSignedNumber(s.diffCoins)}</p>
                            </div>

                            <div className="col-span-2 text-right">
                              <p className={"text-sm font-semibold " + (profit < 0 ? "text-red-600" : "text-neutral-900")}>
                                {formatSignedYen(profit)}
                              </p>
                            </div>

                            <div className="col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => deleteSession(s.date, s.id)}
                                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {isJudgePrefill ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-sm font-semibold text-neutral-900">実戦情報（自動入力）</p>
                  <div className="mt-2 space-y-1 text-sm text-neutral-700">
                    <div className="flex items-center justify-between gap-3">
                      <span>日付</span>
                      <span className="font-semibold text-neutral-900">{modalDate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>機種</span>
                      <span className="truncate font-semibold text-neutral-900">{modalMachineName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>G数</span>
                      <span className="font-semibold text-neutral-900">
                        {new Intl.NumberFormat("ja-JP").format(parseNonNegativeIntOrZero(modalGames))}
                      </span>
                    </div>
                  </div>

                  {modalValidation.fieldErrors.date ? (
                    <p className="mt-2 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.date}</p>
                  ) : null}
                  {modalValidation.fieldErrors.machineName ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {modalValidation.fieldErrors.machineName}
                    </p>
                  ) : null}
                  {modalValidation.fieldErrors.games ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.games}</p>
                  ) : null}

                  <div className="mt-3 space-y-3 border-t border-neutral-200 pt-3">
                    <p className="text-sm font-semibold text-neutral-900">追加情報（任意）</p>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-neutral-900">BIG</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={modalBigCount}
                          onChange={(e) => setModalBigCount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                        />
                        {modalValidation.fieldErrors.bigCount ? (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            {modalValidation.fieldErrors.bigCount}
                          </p>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="text-sm font-semibold text-neutral-900">REG</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={modalRegCount}
                          onChange={(e) => setModalRegCount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                        />
                        {modalValidation.fieldErrors.regCount ? (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            {modalValidation.fieldErrors.regCount}
                          </p>
                        ) : null}
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">推測設定（1〜6）</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={modalGuessedSetting}
                        onChange={(e) => setModalGuessedSetting(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      />
                      {modalValidation.fieldErrors.guessedSetting ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {modalValidation.fieldErrors.guessedSetting}
                        </p>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">台番</span>
                      <input
                        type="text"
                        value={modalMachineNumber}
                        onChange={(e) => setModalMachineNumber(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">店舗名</span>
                      <input
                        type="text"
                        value={modalShopName}
                        onChange={(e) => setModalShopName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">日付</span>
                    <input
                      type="date"
                      value={modalDate}
                      onChange={(e) => setModalDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                    {modalValidation.fieldErrors.date ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.date}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">機種名</span>
                    <input
                      type="text"
                      value={modalMachineName}
                      onChange={(e) => setModalMachineName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                    {modalValidation.fieldErrors.machineName ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {modalValidation.fieldErrors.machineName}
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">G数</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalGames}
                      onChange={(e) => setModalGames(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                    {modalValidation.fieldErrors.games ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.games}</p>
                    ) : null}
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">BIG</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={modalBigCount}
                        onChange={(e) => setModalBigCount(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      />
                      {modalValidation.fieldErrors.bigCount ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {modalValidation.fieldErrors.bigCount}
                        </p>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">REG</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={modalRegCount}
                        onChange={(e) => setModalRegCount(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      />
                      {modalValidation.fieldErrors.regCount ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {modalValidation.fieldErrors.regCount}
                        </p>
                      ) : null}
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">推測設定（1〜6）</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalGuessedSetting}
                      onChange={(e) => setModalGuessedSetting(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                    {modalValidation.fieldErrors.guessedSetting ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {modalValidation.fieldErrors.guessedSetting}
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">台番</span>
                    <input
                      type="text"
                      value={modalMachineNumber}
                      onChange={(e) => setModalMachineNumber(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">店舗名</span>
                    <input
                      type="text"
                      value={modalShopName}
                      onChange={(e) => setModalShopName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-neutral-900">差枚</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalDiffCoins}
                      onChange={(e) => setModalDiffCoins(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                    {modalValidation.fieldErrors.diffCoins ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.diffCoins}</p>
                    ) : null}
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-neutral-900">投資</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={modalInvest}
                  onChange={(e) => setModalInvest(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
                {modalValidation.fieldErrors.invest ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.invest}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-neutral-900">回収</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={modalCollect}
                  onChange={(e) => setModalCollect(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
                {modalValidation.fieldErrors.collect ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.collect}</p>
                ) : null}
              </label>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-sm font-semibold text-neutral-900">収支（回収 - 投資）</p>
                <p className={"mt-1 text-lg font-semibold " + (modalProfit < 0 ? "text-red-600" : "text-neutral-900")}>
                  {formatSignedYen(modalProfit)}
                </p>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={saveModal}
                  disabled={!modalValidation.isValid}
                  aria-disabled={!modalValidation.isValid}
                  className={
                    "flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white " +
                    (!modalValidation.isValid ? "opacity-50" : "")
                  }
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </main>
  );
}
