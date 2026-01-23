"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  dbId?: string;
  date: ISODate;
  machineName: string;
  games: number;
  bigCount?: number;
  regCount?: number;
  guessedSetting?: number | null;
  machineNumber?: string;
  shopName?: string;
  memo?: string;
  diffCoins: number;
  invest: number;
  collect: number;
  judgeResultId?: string | null;
  judgeInputCount?: number | null;
  hintTotalCount?: number | null;
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

function calcJudgeInputCountFromParsed(parsed: unknown): number | null {
  // 「判別要素の入力回数」= いくつの判別要素を入力したか（数値の合計ではない）
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const rec = parsed as Record<string, unknown>;

  const isPosInt = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v > 0;
  const isPosNum = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;

  let count = 0;

  if (isPosInt(rec.games) || isPosNum(rec.games)) count += 1;
  if (isPosInt(rec.bigCount) || isPosNum(rec.bigCount)) count += 1;
  if (isPosInt(rec.regCount) || isPosNum(rec.regCount)) count += 1;
  if (isPosInt(rec.extraCount) || isPosNum(rec.extraCount)) count += 1;

  const extraCounts = rec.extraCounts;
  if (typeof extraCounts === "object" && extraCounts !== null && !Array.isArray(extraCounts)) {
    for (const v of Object.values(extraCounts as Record<string, unknown>)) {
      if (isPosInt(v) || isPosNum(v)) count += 1;
    }
  }

  // binomial は「1要素=1カウント」として、hitsが入っているものを採用（trials自動入力もあるため）
  const binomialHits = rec.binomialHits;
  if (typeof binomialHits === "object" && binomialHits !== null && !Array.isArray(binomialHits)) {
    for (const v of Object.values(binomialHits as Record<string, unknown>)) {
      if (isPosInt(v) || isPosNum(v)) count += 1;
    }
  }

  // suika / uraAT は trials が入っていれば1要素としてカウント
  if (isPosInt(rec.suikaTrials) || isPosNum(rec.suikaTrials)) count += 1;
  if (isPosInt(rec.uraAtTrials) || isPosNum(rec.uraAtTrials)) count += 1;

  return count;
}

function calcHintTotalCountFromHintCounts(hintCounts: unknown): number | null {
  if (hintCounts === null || hintCounts === undefined) return 0;
  if (typeof hintCounts !== "object" || Array.isArray(hintCounts)) return null;
  let total = 0;
  for (const v of Object.values(hintCounts as Record<string, unknown>)) {
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v <= 0) continue;
    total += Math.trunc(v);
  }
  return total;
}

function sumDayProfit(sessions: SlotSession[] | undefined) {
  if (!sessions || sessions.length === 0) return 0;
  return sessions.reduce((acc, s) => acc + calcProfit(s.invest, s.collect), 0);
}

type MachineNoSummaryRow = {
  shopName: string;
  machineNumber: string;
  plays: number;
  totalProfit: number;
  avgProfit: number;
  lastPlayedAt: ISODate;
};

function useMonthlyStats(recordsByDate: RecordSessionsByDate, cursorMonth: Date) {
  return useMemo(() => {
    const year = cursorMonth.getFullYear();
    const monthIndex = cursorMonth.getMonth(); // 0..11

    let totalProfit = 0;
    let playedDays = 0;
    let plusDays = 0;

    for (const [iso, sessions] of Object.entries(recordsByDate)) {
      if (!sessions || sessions.length === 0) continue;
      const d = parseISODateToDate(iso);
      if (!d) continue;
      if (d.getFullYear() !== year || d.getMonth() !== monthIndex) continue;

      const dayProfit = sumDayProfit(sessions);
      totalProfit += dayProfit;
      playedDays += 1;
      if (dayProfit > 0) plusDays += 1;
    }

    const avgPerPlayedDay = playedDays > 0 ? Math.round(totalProfit / playedDays) : 0;
    return { totalProfit, playedDays, plusDays, avgPerPlayedDay };
  }, [cursorMonth, recordsByDate]);
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

  const monthlyStats = useMonthlyStats(recordsByDate, cursorMonth);

  const [isModalOpen, setIsModalOpen] = useState(prefill.shouldOpen);
  const [modalDate, setModalDate] = useState<string>(prefill.date);
  const [modalMachineName, setModalMachineName] = useState<string>(prefill.machineName);
  const [modalGames, setModalGames] = useState<string>(prefill.games);
  const [modalBigCount, setModalBigCount] = useState<string>(prefill.bigCount);
  const [modalRegCount, setModalRegCount] = useState<string>(prefill.regCount);
  const [modalGuessedSetting, setModalGuessedSetting] = useState<string>(prefill.guessedSetting);
    const [modalMachineNumber, setModalMachineNumber] = useState<string>("");
    const [modalShopName, setModalShopName] = useState<string>("");
    const [modalMemo, setModalMemo] = useState<string>("");
  const [modalDiffCoins, setModalDiffCoins] = useState<string>("0");
  const [modalInvest, setModalInvest] = useState<string>("0");
  const [modalCollect, setModalCollect] = useState<string>("0");
  const [modalJudgeResultId, setModalJudgeResultId] = useState<string | null>(prefill.judgeResultId);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionDate, setEditingSessionDate] = useState<ISODate | null>(null);

  const [modalJudgeInputCount, setModalJudgeInputCount] = useState<number | null>(null);
  const [modalHintTotalCount, setModalHintTotalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!modalJudgeResultId) {
      setModalJudgeInputCount(null);
      setModalHintTotalCount(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/judge-results/${encodeURIComponent(modalJudgeResultId)}`);
        const json = (await res.json().catch(() => null)) as
          | {
              ok?: boolean;
              judgeResult?: { input?: unknown };
            }
          | null;
        if (!res.ok || !json?.ok) throw new Error("failed");

        const input = json.judgeResult?.input;
        const parsed =
          typeof input === "object" && input !== null && !Array.isArray(input)
            ? (input as Record<string, unknown>).parsed
            : null;
        const hintCounts =
          typeof input === "object" && input !== null && !Array.isArray(input)
            ? (input as Record<string, unknown>).hintCounts
            : null;

        const judgeInputCount = calcJudgeInputCountFromParsed(parsed);
        const hintTotal = calcHintTotalCountFromHintCounts(hintCounts);

        if (cancelled) return;
        setModalJudgeInputCount(judgeInputCount);
        setModalHintTotalCount(hintTotal);
      } catch {
        if (cancelled) return;
        setModalJudgeInputCount(null);
        setModalHintTotalCount(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [modalJudgeResultId]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedShopName, setSelectedShopName] = useState<string>("");
  const [selectedMachineNo, setSelectedMachineNo] = useState<string>("");

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const allSessions = useMemo(() => {
    const out: SlotSession[] = [];
    for (const sessions of Object.values(recordsByDate)) out.push(...sessions);
    return out;
  }, [recordsByDate]);

  const shopCandidates = useMemo(() => {
    const counts = new Map<string, number>();
    const lastSeen = new Map<string, ISODate>();
    for (const s of allSessions) {
      const shop = s.shopName?.trim();
      if (!shop) continue;
      counts.set(shop, (counts.get(shop) ?? 0) + 1);
      const prev = lastSeen.get(shop);
      if (!prev || prev < s.date) lastSeen.set(shop, s.date);
    }
    const shops = Array.from(counts.keys());
    shops.sort((a, b) => {
      const aLast = lastSeen.get(a) ?? ("0000-00-00" as ISODate);
      const bLast = lastSeen.get(b) ?? ("0000-00-00" as ISODate);
      if (aLast !== bLast) return aLast < bLast ? 1 : -1;
      const aCnt = counts.get(a) ?? 0;
      const bCnt = counts.get(b) ?? 0;
      if (aCnt !== bCnt) return bCnt - aCnt;
      return a.localeCompare(b, "ja-JP");
    });
    return shops;
  }, [allSessions]);

  useEffect(() => {
    if (selectedShopName.trim()) return;
    if (shopCandidates.length === 0) return;
    setSelectedShopName(shopCandidates[0] ?? "");
  }, [selectedShopName, shopCandidates]);

  useEffect(() => {
    // 店舗変更時は台番フィルタを解除（混乱防止）
    setSelectedMachineNo("");
  }, [selectedShopName]);

  const storeEntries = useMemo(() => {
    const shop = selectedShopName.trim();
    if (!shop) return [];
    return allSessions.filter((s) => (s.shopName?.trim() ?? "") === shop);
  }, [allSessions, selectedShopName]);

  const machineNoSummaryRows = useMemo(() => {
    const shop = selectedShopName.trim();
    if (!shop) return [];
    const byKey = new Map<string, MachineNoSummaryRow>();

    for (const s of storeEntries) {
      const machineNumber = s.machineNumber?.trim();
      if (!machineNumber) continue;

      const key = `${shop}__${machineNumber}`;
      const profit = calcProfit(s.invest, s.collect);

      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, {
          shopName: shop,
          machineNumber,
          plays: 1,
          totalProfit: profit,
          avgProfit: profit,
          lastPlayedAt: s.date,
        });
        continue;
      }

      const plays = prev.plays + 1;
      const totalProfit = prev.totalProfit + profit;
      const lastPlayedAt = prev.lastPlayedAt < s.date ? s.date : prev.lastPlayedAt;
      byKey.set(key, {
        ...prev,
        plays,
        totalProfit,
        avgProfit: Math.round(totalProfit / plays),
        lastPlayedAt,
      });
    }

    const rows = Array.from(byKey.values());
    rows.sort((a, b) => {
      if (a.totalProfit !== b.totalProfit) return b.totalProfit - a.totalProfit;
      if (a.plays !== b.plays) return b.plays - a.plays;
      if (a.lastPlayedAt !== b.lastPlayedAt) return a.lastPlayedAt < b.lastPlayedAt ? 1 : -1;
      return a.machineNumber.localeCompare(b.machineNumber, "ja-JP");
    });
    return rows;
  }, [selectedShopName, storeEntries]);

  const topPlus5 = useMemo(() => {
    return machineNoSummaryRows
      .filter((r) => r.totalProfit > 0)
      .slice(0, 5);
  }, [machineNoSummaryRows]);

  const topMinus5 = useMemo(() => {
    const rows = machineNoSummaryRows
      .filter((r) => r.totalProfit < 0)
      .slice()
      .sort((a, b) => a.totalProfit - b.totalProfit);
    return rows.slice(0, 5);
  }, [machineNoSummaryRows]);

  const topPlays5 = useMemo(() => {
    const rows = machineNoSummaryRows
      .slice()
      .sort((a, b) => {
        if (a.plays !== b.plays) return b.plays - a.plays;
        if (a.totalProfit !== b.totalProfit) return b.totalProfit - a.totalProfit;
        if (a.lastPlayedAt !== b.lastPlayedAt) return a.lastPlayedAt < b.lastPlayedAt ? 1 : -1;
        return a.machineNumber.localeCompare(b.machineNumber, "ja-JP");
      });
    return rows.slice(0, 5);
  }, [machineNoSummaryRows]);

  const filteredStoreEntries = useMemo(() => {
    const machineNo = selectedMachineNo.trim();
    if (!machineNo) return storeEntries;
    return storeEntries.filter((s) => (s.machineNumber?.trim() ?? "") === machineNo);
  }, [selectedMachineNo, storeEntries]);

  const modalValidation = useMemo(() => {
    const fieldErrors: Partial<
      Record<
        | "date"
        | "machineName"
        | "games"
        | "bigCount"
        | "regCount"
        | "guessedSetting"
        | "memo"
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

    const memo = modalMemo.trim();
    if (memo.length > 500) fieldErrors.memo = "メモは500文字以内で入力してください";

    const parsed = {
      date: date as ISODate,
      machineName,
      games: parseNonNegativeIntOrZero(modalGames),
      bigCount: parseNonNegativeIntOrNull(modalBigCount),
      regCount: parseNonNegativeIntOrNull(modalRegCount),
      guessedSetting: parseGuessedSetting(modalGuessedSetting),
      machineNumber: modalMachineNumber.trim(),
      shopName: modalShopName.trim(),
      memo,
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
    modalMemo,
  ]);

  const modalProfit = useMemo(() => {
    return calcProfit(modalValidation.parsed.invest, modalValidation.parsed.collect);
  }, [modalValidation.parsed.collect, modalValidation.parsed.invest]);

  const sessionsForModalDate = useMemo(() => {
    const date = modalDate as ISODate;
    return recordsByDate[date] ?? [];
  }, [modalDate, recordsByDate]);

  const editingSession = useMemo(() => {
    if (!editingSessionId || !editingSessionDate) return null;
    const list = recordsByDate[editingSessionDate] ?? [];
    return list.find((s) => s.id === editingSessionId) ?? null;
  }, [editingSessionDate, editingSessionId, recordsByDate]);

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

    setEditingSessionId(null);
    setEditingSessionDate(null);

    setModalDate(iso);
    setModalMachineName("");
    setModalGames("0");
    setModalBigCount("");
    setModalRegCount("");
    setModalGuessedSetting("");
    setModalMachineNumber("");
    setModalShopName("");
    setModalMemo("");
    setModalDiffCoins("0");
    setModalInvest("0");
    setModalCollect("0");
    setModalJudgeResultId(null);
    setModalJudgeInputCount(null);
    setModalHintTotalCount(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setEditingSessionId(null);
    setEditingSessionDate(null);
    setIsModalOpen(false);
  }

  function startEditSession(s: SlotSession) {
    setEditingSessionId(s.id);
    setEditingSessionDate(s.date);

    setModalDate(s.date);
    setModalMachineName(s.machineName ?? "");
    setModalGames(String(s.games ?? 0));
    setModalBigCount(s.bigCount === undefined ? "" : String(s.bigCount));
    setModalRegCount(s.regCount === undefined ? "" : String(s.regCount));
    setModalGuessedSetting(
      s.guessedSetting === undefined || s.guessedSetting === null ? "" : String(s.guessedSetting),
    );
    setModalMachineNumber(s.machineNumber ?? "");
    setModalShopName(s.shopName ?? "");
    setModalMemo(s.memo ?? "");
    setModalDiffCoins(String(s.diffCoins ?? 0));
    setModalInvest(String(s.invest ?? 0));
    setModalCollect(String(s.collect ?? 0));
    setModalJudgeResultId(s.judgeResultId ?? null);
  }

  function clearEditing() {
    setEditingSessionId(null);
    setEditingSessionDate(null);

    // 編集解除＝新規追加状態に戻す
    setModalMachineName("");
    setModalGames("0");
    setModalBigCount("");
    setModalRegCount("");
    setModalGuessedSetting("");
    setModalMachineNumber("");
    setModalShopName("");
    setModalMemo("");
    setModalDiffCoins("0");
    setModalInvest("0");
    setModalCollect("0");
    setModalJudgeResultId(null);
    setModalJudgeInputCount(null);
    setModalHintTotalCount(null);
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
    const isEditing = Boolean(editingSessionId);
    const sessionId = editingSessionId ?? (globalThis.crypto?.randomUUID?.() ?? `${date}-${Date.now()}`);
    const session: SlotSession = {
      id: sessionId,
      dbId: editingSession?.dbId,
      date,
      machineName: modalValidation.parsed.machineName,
      games: modalValidation.parsed.games,
      bigCount: modalValidation.parsed.bigCount ?? undefined,
      regCount: modalValidation.parsed.regCount ?? undefined,
      guessedSetting: modalValidation.parsed.guessedSetting,
      machineNumber: modalValidation.parsed.machineNumber || undefined,
      shopName: modalValidation.parsed.shopName || undefined,
      memo: modalValidation.parsed.memo || undefined,
      diffCoins: modalValidation.parsed.diffCoins,
      invest: modalValidation.parsed.invest,
      collect: modalValidation.parsed.collect,
      judgeResultId: modalJudgeResultId,
      judgeInputCount: modalJudgeInputCount,
      hintTotalCount: modalHintTotalCount,
    };

    updateRecords((prev) => {
      const next: RecordSessionsByDate = { ...prev };

      if (isEditing && editingSessionId && editingSessionDate) {
        const from = editingSessionDate;
        const to = date;

        if (from === to) {
          const daySessions = next[to] ?? [];
          let replaced = false;
          const updated = daySessions.map((s) => {
            if (s.id !== editingSessionId) return s;
            replaced = true;
            return session;
          });
          next[to] = replaced ? updated : [...daySessions, session];
        } else {
          const fromList = next[from] ?? [];
          const without = fromList.filter((s) => s.id !== editingSessionId);
          if (without.length === 0) delete next[from];
          else next[from] = without;

          const toList = next[to] ?? [];
          next[to] = [...toList, session];
        }
      } else {
        const nextDaySessions = [...(next[date] ?? []), session];
        next[date] = nextDaySessions;
      }

      return next;
    });

    // DB連携（追加: POST / 更新: PATCH）
    try {
      if (isEditing) {
        const dbId = editingSession?.dbId;
        if (dbId && isLoggedIn) {
          const res = await fetch(`/api/sessions/${encodeURIComponent(dbId)}`,
            {
              method: "PATCH",
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
            },
          );

          const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
          if (res.ok && json?.ok) {
            setToastMessage("更新しました");
          }
        }
      } else {
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

        const json = (await res.json().catch(() => null)) as { ok?: boolean; id?: string } | null;
        if (res.ok && json?.ok) {
          if (json.id) {
            updateRecords((prev) => {
              const list = prev[date] ?? [];
              const nextList = list.map((s) => (s.id === sessionId ? { ...s, dbId: json.id } : s));
              return { ...prev, [date]: nextList };
            });
          }
          setToastMessage("保存しました");
          // 判別からのqueryを消して、リロードで再登録が起きないようにする
          router.replace(pathname);
        }
      }
    } catch {
      // ローカル保存は成功しているため、ここでは何もしない
    }

    clearEditing();
    setIsModalOpen(false);
  }

  function deleteSession(date: ISODate, sessionId: string, dbId?: string) {
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

    if (editingSessionId === sessionId) {
      clearEditing();
    }

    // DB削除（ログイン時 & dbId がある場合のみ）
    if (dbId && isLoggedIn) {
      void fetch(`/api/sessions/${encodeURIComponent(dbId)}`,
        { method: "DELETE" },
      ).catch(() => {
        // ignore
      });
    }
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-900">店舗ごとの台番サマリ</h2>
            <p className="mt-1 text-xs text-neutral-600">
              同一店舗 + 同一台番の実戦を合算して表示します。
            </p>
          </div>

          <div className="w-full sm:w-auto sm:shrink-0">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-700">店舗</span>
              <select
                value={selectedShopName}
                onChange={(e) => setSelectedShopName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm sm:w-[220px]"
              >
                <option value="">（選択してください）</option>
                {shopCandidates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 md:hidden">
              {selectedShopName.trim() ? (
                <Link
                  href={`/record/store-summary?shop=${encodeURIComponent(selectedShopName.trim())}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  店舗サマリを見る
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white opacity-50"
                >
                  店舗サマリを見る
                </button>
              )}
              <p className="mt-2 text-xs text-neutral-600">
                ※モバイルでは別ページで見やすく表示します
              </p>
            </div>
          </div>
        </div>

        {!selectedShopName.trim() ? (
          <p className="mt-3 text-sm text-neutral-700">店舗を選択するとサマリが表示されます。</p>
        ) : machineNoSummaryRows.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-700">
            この店舗の「台番あり」の実戦データがありません。
          </p>
        ) : (
          <div className="mt-4 hidden gap-3 md:grid">
            {(
              [
                { title: "プラス上位Top5", rows: topPlus5 },
                { title: "マイナス上位Top5", rows: topMinus5 },
                { title: "回数Top5", rows: topPlays5 },
              ] as const
            ).map((card) => (
              <div key={card.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">{card.title}</p>

                {card.rows.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-700">該当データがありません。</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-xs">
                      <thead>
                        <tr className="text-left text-neutral-600">
                          <th className="px-3 py-2 border border-neutral-200">台番</th>
                          <th className="px-3 py-2 border border-neutral-200 text-right">回数</th>
                          <th className="px-3 py-2 border border-neutral-200 text-right">累計</th>
                          <th className="px-3 py-2 border border-neutral-200 text-right">平均</th>
                          <th className="px-3 py-2 border border-neutral-200 text-right">最終日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {card.rows.map((r) => {
                          const active = selectedMachineNo.trim() === r.machineNumber;
                          const profitClass =
                            r.totalProfit < 0 ? "text-red-600" : "text-neutral-900";
                          return (
                            <tr
                              key={`${r.shopName}__${r.machineNumber}`}
                              className={
                                "cursor-pointer " +
                                (active ? "bg-white" : "bg-neutral-50")
                              }
                              onClick={() =>
                                setSelectedMachineNo((prev) =>
                                  prev.trim() === r.machineNumber ? "" : r.machineNumber,
                                )
                              }
                            >
                              <td className="px-3 py-2 border border-neutral-200 font-semibold text-neutral-900">
                                {r.machineNumber}
                                {active ? "（選択中）" : ""}
                              </td>
                              <td className="px-3 py-2 border border-neutral-200 text-right text-neutral-900">
                                {r.plays}
                              </td>
                              <td className={`px-3 py-2 border border-neutral-200 text-right font-semibold ${profitClass}`}>
                                {formatSignedYen(r.totalProfit)}
                              </td>
                              <td className={`px-3 py-2 border border-neutral-200 text-right font-semibold ${profitClass}`}>
                                {formatSignedYen(r.avgProfit)}
                              </td>
                              <td className="px-3 py-2 border border-neutral-200 text-right text-neutral-900">
                                {r.lastPlayedAt}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-900">この店舗の実戦履歴</p>
                {selectedMachineNo.trim() ? (
                  <button
                    type="button"
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900"
                    onClick={() => setSelectedMachineNo("")}
                  >
                    台番フィルタ解除（{selectedMachineNo}）
                  </button>
                ) : null}
              </div>

              {filteredStoreEntries.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-700">該当データがありません。</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {[...filteredStoreEntries]
                    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
                    .slice(0, 50)
                    .map((s) => {
                      const profit = calcProfit(s.invest, s.collect);
                      return (
                        <div
                          key={`${s.id}`}
                          className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900">
                                {s.date} / 台番 {s.machineNumber ?? "-"}
                              </p>
                              <p className="mt-1 truncate text-xs text-neutral-700">
                                {s.machineName}
                              </p>
                              {s.memo ? (
                                <p className="mt-1 max-h-16 overflow-hidden whitespace-pre-wrap text-xs text-neutral-700">
                                  メモ：{s.memo}
                                </p>
                              ) : null}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={"text-sm font-semibold " + (profit < 0 ? "text-red-600" : "text-neutral-900")}>
                                {formatSignedYen(profit)}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-neutral-700">
                                差枚 {formatSignedNumber(s.diffCoins)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {filteredStoreEntries.length > 50 ? (
                    <p className="pt-1 text-xs text-neutral-600">
                      表示は最新50件までです。
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

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

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-900">今月の収支</p>
          <p
            className={
              "mt-2 truncate text-xl font-semibold " +
              (monthlyStats.totalProfit < 0
                ? "text-red-600"
                : monthlyStats.totalProfit > 0
                  ? "text-green-600"
                  : "text-neutral-900")
            }
          >
            {formatSignedYen(monthlyStats.totalProfit)}円
          </p>
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
              dayProfit === null
                ? "text-neutral-400"
                : dayProfit < 0
                  ? "text-red-600"
                  : dayProfit > 0
                    ? "text-green-600"
                    : "text-neutral-700";

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
                <div className="flex min-h-[56px] flex-col justify-between">
                  <div className="text-left">
                    <span className="text-xs font-semibold text-neutral-700">
                      {cell.date.getDate()}
                    </span>
                  </div>

                  <div className="text-center">
                    <div
                      className={
                        "text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis sm:text-sm " +
                        profitClass
                      }
                    >
                      {profitText}
                    </div>
                  </div>
                </div>
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
                  <div className="hidden md:grid md:grid-cols-12 md:gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700">
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
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:grid-cols-12 md:gap-2">
                            <div className="min-w-0 md:col-span-4">
                              <p className="truncate text-sm font-semibold text-neutral-900">{s.machineName}</p>

                              {/* Mobile: numbers live in the left column to avoid being hidden by action buttons */}
                              <div className="mt-2 space-y-1 md:hidden">
                                <div className="flex items-center justify-between gap-3 text-[11px]">
                                  <span className="text-neutral-700">G</span>
                                  <span className="font-semibold text-neutral-900">
                                    {new Intl.NumberFormat("ja-JP").format(s.games)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[11px]">
                                  <span className="text-neutral-700">差枚</span>
                                  <span className="font-semibold text-neutral-900">{formatSignedNumber(s.diffCoins)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[11px]">
                                  <span className="text-neutral-700">収支</span>
                                  <span
                                    className={
                                      "font-semibold " + (profit < 0 ? "text-red-600" : "text-neutral-900")
                                    }
                                  >
                                    {formatSignedYen(profit)}
                                  </span>
                                </div>
                              </div>

                              <p className="mt-1 text-[11px] text-neutral-700">
                                投資 {new Intl.NumberFormat("ja-JP").format(s.invest)} / 回収 {new Intl.NumberFormat("ja-JP").format(s.collect)}
                              </p>
                              {s.machineNumber || s.judgeInputCount || s.hintTotalCount ? (
                                <p className="mt-1 text-[11px] text-neutral-700">
                                  {s.machineNumber ? `台番 ${s.machineNumber}` : null}
                                  {s.machineNumber && (s.judgeInputCount || s.hintTotalCount) ? " / " : null}
                                  {typeof s.judgeInputCount === "number" ? `判別要素 ${s.judgeInputCount}` : null}
                                  {typeof s.judgeInputCount === "number" && typeof s.hintTotalCount === "number"
                                    ? " / "
                                    : null}
                                  {typeof s.hintTotalCount === "number" ? `示唆合計 ${s.hintTotalCount}` : null}
                                </p>
                              ) : null}

                              {s.memo ? (
                                <p className="mt-1 max-h-16 overflow-hidden whitespace-pre-wrap text-[11px] text-neutral-700">
                                  メモ：{s.memo}
                                </p>
                              ) : null}
                            </div>

                            <div className="hidden text-right md:block md:col-span-2">
                              <p className="text-sm font-semibold text-neutral-900">{new Intl.NumberFormat("ja-JP").format(s.games)}</p>
                            </div>

                            <div className="hidden text-right md:block md:col-span-2">
                              <p className="text-sm font-semibold text-neutral-900">{formatSignedNumber(s.diffCoins)}</p>
                            </div>

                            <div className="hidden text-right md:block md:col-span-2">
                              <p className={"text-sm font-semibold " + (profit < 0 ? "text-red-600" : "text-neutral-900")}>
                                {formatSignedYen(profit)}
                              </p>
                            </div>

                            <div className="shrink-0 md:col-span-2 md:flex md:justify-end">
                              <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditSession(s)}
                                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 md:w-auto"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSession(s.date, s.id, s.dbId)}
                                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 md:w-auto"
                                >
                                  削除
                                </button>
                              </div>
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
              {editingSession ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-neutral-900">
                      編集中：{editingSession.machineName}
                    </p>
                    <button
                      type="button"
                      onClick={clearEditing}
                      className="shrink-0 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900"
                    >
                      編集解除
                    </button>
                  </div>
                </div>
              ) : null}
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

                    <label className="block">
                      <span className="text-sm font-semibold text-neutral-900">メモ（備考）</span>
                      <textarea
                        value={modalMemo}
                        onChange={(e) => setModalMemo(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                        placeholder="例：イベント日 / 末尾 / 据え置き濃厚 など"
                      />
                      {modalValidation.fieldErrors.memo ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {modalValidation.fieldErrors.memo}
                        </p>
                      ) : null}
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
                    <span className="text-sm font-semibold text-neutral-900">メモ（備考）</span>
                    <textarea
                      value={modalMemo}
                      onChange={(e) => setModalMemo(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      placeholder="例：イベント日 / 末尾 / 据え置き濃厚 など"
                    />
                    {modalValidation.fieldErrors.memo ? (
                      <p className="mt-1 text-xs font-semibold text-red-600">{modalValidation.fieldErrors.memo}</p>
                    ) : null}
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
                  {editingSessionId ? "更新" : "追加"}
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
