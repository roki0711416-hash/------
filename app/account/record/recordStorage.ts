import type { RecordSessionsByDate, SlotSession, ISODate } from "./RecordClient";

export type RecordStorage = {
  load: () => RecordSessionsByDate;
  save: (data: RecordSessionsByDate) => void;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isSlotSession(v: unknown): v is SlotSession {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.date === "string" &&
    typeof v.machineName === "string" &&
    typeof v.games === "number" &&
    (v.bigCount === undefined || typeof v.bigCount === "number") &&
    (v.regCount === undefined || typeof v.regCount === "number") &&
    (v.guessedSetting === undefined || v.guessedSetting === null || typeof v.guessedSetting === "number") &&
    (v.machineNumber === undefined || typeof v.machineNumber === "string") &&
    (v.shopName === undefined || typeof v.shopName === "string") &&
    typeof v.diffCoins === "number" &&
    typeof v.invest === "number" &&
    typeof v.collect === "number" &&
    (v.judgeResultId === undefined || v.judgeResultId === null || typeof v.judgeResultId === "string")
  );
}

function normalizeStoredData(raw: unknown): RecordSessionsByDate {
  if (!isPlainObject(raw)) return {};
  const out: RecordSessionsByDate = {};

  for (const [dateKey, value] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
    if (!Array.isArray(value)) continue;
    const sessions = value.filter(isSlotSession);
    if (sessions.length === 0) continue;
    out[dateKey as ISODate] = sessions;
  }

  return out;
}

export function createLocalStorageRecordStorage(storageKey: string): RecordStorage {
  return {
    load: () => {
      try {
        const raw = globalThis.localStorage?.getItem(storageKey);
        if (!raw) return {};
        return normalizeStoredData(JSON.parse(raw));
      } catch {
        return {};
      }
    },
    save: (data) => {
      try {
        globalThis.localStorage?.setItem(storageKey, JSON.stringify(data));
      } catch {
        // ignore
      }
    },
  };
}

export function createDummyDbRecordStorage(userId: string): RecordStorage {
  // DB実装に差し替える想定。現状は localStorage を "user" 名前空間で使うダミー。
  return createLocalStorageRecordStorage(`slokasu.record.user.v1:${userId}`);
}
