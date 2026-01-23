"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  createDummyDbRecordStorage,
  createLocalStorageRecordStorage,
  type RecordStorage,
} from "@/app/account/record/recordStorage";

import type {
  ISODate,
  RecordSessionsByDate,
  SlotSession,
} from "@/app/account/record/RecordClient";

function formatSignedYen(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("ja-JP").format(n)}`;
}

function formatSignedNumber(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("ja-JP").format(n)}`;
}

function calcProfit(invest: number, collect: number) {
  return collect - invest;
}

type MachineNoSummaryRow = {
  shopName: string;
  machineNumber: string;
  plays: number;
  totalProfit: number;
  avgProfit: number;
  lastPlayedAt: ISODate;
};

function buildMachineNoSummaryRows(args: { shopName: string; sessions: SlotSession[] }) {
  const { shopName, sessions } = args;
  const byKey = new Map<string, MachineNoSummaryRow>();

  for (const s of sessions) {
    const machineNumber = s.machineNumber?.trim();
    if (!machineNumber) continue;

    const key = `${shopName}__${machineNumber}`;
    const profit = calcProfit(s.invest, s.collect);

    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, {
        shopName,
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
}

export default function StoreSummaryClient({
  isLoggedIn,
  userId,
  shopName,
}: {
  isLoggedIn: boolean;
  userId?: string;
  shopName: string;
}) {
  const selectedShopName = shopName.trim();

  const guestStorage = useMemo<RecordStorage>(() => {
    return createLocalStorageRecordStorage("slokasu.record.guest.v1");
  }, []);

  const activeStorage = useMemo<RecordStorage>(() => {
    if (!isLoggedIn) return guestStorage;
    return createDummyDbRecordStorage(userId ?? "anonymous");
  }, [guestStorage, isLoggedIn, userId]);

  const [recordsByDate] = useState<RecordSessionsByDate>(() => activeStorage.load());

  const allSessions = useMemo(() => {
    const out: SlotSession[] = [];
    for (const sessions of Object.values(recordsByDate)) out.push(...sessions);
    return out;
  }, [recordsByDate]);

  const storeEntries = useMemo(() => {
    if (!selectedShopName) return [];
    return allSessions.filter((s) => (s.shopName?.trim() ?? "") === selectedShopName);
  }, [allSessions, selectedShopName]);

  const machineNoSummaryRows = useMemo(() => {
    if (!selectedShopName) return [];
    return buildMachineNoSummaryRows({ shopName: selectedShopName, sessions: storeEntries });
  }, [selectedShopName, storeEntries]);

  const topPlus5 = useMemo(() => {
    return machineNoSummaryRows.filter((r) => r.totalProfit > 0).slice(0, 5);
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

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">店舗サマリ</h1>
          <Link
            href="/record"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
          >
            戻る
          </Link>
        </div>
        <p className="mt-2 text-sm text-neutral-700">店舗ごとの台番Top5と実戦履歴を表示します。</p>
      </header>

      {!selectedShopName ? (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-700">店舗が選択されていません。</p>
          <Link
            href="/record"
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
          >
            収支管理へ戻る
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold text-neutral-700">店舗</p>
            <p className="mt-1 text-base font-semibold text-neutral-900">{selectedShopName}</p>
          </section>

          <section className="mt-4 space-y-3">
            {(
              [
                { title: "プラス上位Top5", rows: topPlus5 },
                { title: "マイナス上位Top5", rows: topMinus5 },
                { title: "回数Top5", rows: topPlays5 },
              ] as const
            ).map((card) => (
              <div key={card.title} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <p className="text-sm font-semibold text-neutral-900">{card.title}</p>

                {card.rows.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-700">該当データがありません。</p>
                ) : (
                  <div className="mt-3 w-full overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-xs">
                      <thead>
                        <tr className="text-left text-neutral-600">
                          <th className="border border-neutral-200 px-3 py-2">台番</th>
                          <th className="border border-neutral-200 px-3 py-2 text-right">回数</th>
                          <th className="border border-neutral-200 px-3 py-2 text-right">累計</th>
                          <th className="border border-neutral-200 px-3 py-2 text-right">平均</th>
                          <th className="border border-neutral-200 px-3 py-2 text-right">最終日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {card.rows.map((r) => {
                          const profitClass = r.totalProfit < 0 ? "text-red-600" : "text-neutral-900";
                          return (
                            <tr key={`${r.shopName}__${r.machineNumber}`} className="bg-white">
                              <td className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">
                                {r.machineNumber}
                              </td>
                              <td className="border border-neutral-200 px-3 py-2 text-right text-neutral-900">
                                {r.plays}
                              </td>
                              <td className={`border border-neutral-200 px-3 py-2 text-right font-semibold ${profitClass}`}>
                                {formatSignedYen(r.totalProfit)}
                              </td>
                              <td className={`border border-neutral-200 px-3 py-2 text-right font-semibold ${profitClass}`}>
                                {formatSignedYen(r.avgProfit)}
                              </td>
                              <td className="border border-neutral-200 px-3 py-2 text-right text-neutral-900">
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
          </section>

          <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-semibold text-neutral-900">この店舗の実戦履歴</p>

            {storeEntries.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-700">該当データがありません。</p>
            ) : (
              <div className="mt-3 space-y-2">
                {[...storeEntries]
                  .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
                  .slice(0, 50)
                  .map((s) => {
                    const profit = calcProfit(s.invest, s.collect);
                    return (
                      <div key={s.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900">
                              {s.date} / 台番 {s.machineNumber ?? "-"}
                            </p>
                            <p className="mt-1 truncate text-xs text-neutral-700">{s.machineName}</p>
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
                            <p className="mt-1 text-xs font-semibold text-neutral-700">差枚 {formatSignedNumber(s.diffCoins)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {storeEntries.length > 50 ? (
                  <p className="pt-1 text-xs text-neutral-600">表示は最新50件までです。</p>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
