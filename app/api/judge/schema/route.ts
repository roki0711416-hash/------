import { NextResponse } from "next/server";
import { getMachineById } from "@/lib/machines";

type SchemaInput = {
  key: string;
  label: string;
  type: "int" | "float";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
};

type SchemaColumn = {
  label: string;
  value: (st: {
    big: number;
    reg: number;
    total: number;
    rate?: number;
    extra?: number;
    extras?: Record<string, number>;
    binomialRates?: Record<string, number>;
    suikaCzRate?: number;
    uraAtRate?: number;
  }) => number | null;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function pct(n: number) {
  return Number((n * 100).toFixed(3));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const machineId = (searchParams.get("machineId") ?? "").trim();
  if (!machineId) return badRequest("machineId は必須です");

  const machine = await getMachineById(machineId);
  if (!machine) return badRequest("指定された機種が見つかりません");

  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const regLabel = machine.metricsLabels?.regLabel ?? "REG";
  const totalLabel = machine.metricsLabels?.totalLabel ?? "合算";

  const columns: SchemaColumn[] = [
    { label: bigLabel, value: (st) => st.big },
  ];
  if (regLabel !== null) {
    columns.push({ label: regLabel, value: (st) => st.reg });
  }
  if (totalLabel !== null) {
    columns.push({ label: totalLabel, value: (st) => st.total });
  }

  // Optional payout rate
  if (machine.odds.settings.every((st) => typeof st.rate === "number" && Number.isFinite(st.rate))) {
    columns.push({ label: "機械割(%)", value: (st) => st.rate ?? null });
  }

  // Optional single extra
  const extraLabel = machine.metricsLabels?.extraLabel;
  if (extraLabel && machine.odds.settings.every((st) => typeof st.extra === "number" && Number.isFinite(st.extra))) {
    columns.push({ label: extraLabel, value: (st) => st.extra ?? null });
  }

  // extra metrics (1/denominator)
  for (const m of machine.metricsLabels?.extraMetrics ?? []) {
    if (machine.odds.settings.every((st) => typeof st.extras?.[m.id] === "number" && Number.isFinite(st.extras?.[m.id] ?? NaN))) {
      columns.push({ label: m.label, value: (st) => st.extras?.[m.id] ?? null });
    }
  }

  // binomial rates
  for (const m of machine.metricsLabels?.binomialMetrics ?? []) {
    if (machine.odds.settings.every((st) => typeof st.binomialRates?.[m.id] === "number" && Number.isFinite(st.binomialRates?.[m.id] ?? NaN))) {
      const label = m.rateLabel ?? `${m.hitsLabel}率(%)`;
      columns.push({ label, value: (st) => {
        const p = st.binomialRates?.[m.id];
        return typeof p === "number" ? pct(p) : null;
      } });
    }
  }

  // suika / uraAt rates
  if (machine.odds.settings.every((st) => typeof st.suikaCzRate === "number" && Number.isFinite(st.suikaCzRate))) {
    columns.push({
      label: machine.metricsLabels?.suikaCzRateLabel ?? "スイカCZ当選率(%)",
      value: (st) => (typeof st.suikaCzRate === "number" ? pct(st.suikaCzRate) : null),
    });
  }
  if (machine.odds.settings.every((st) => typeof st.uraAtRate === "number" && Number.isFinite(st.uraAtRate))) {
    columns.push({
      label: machine.metricsLabels?.uraAtRateLabel ?? "裏AT直行率(%)",
      value: (st) => (typeof st.uraAtRate === "number" ? pct(st.uraAtRate) : null),
    });
  }

  const settingsTable = {
    columns: columns.map((c) => c.label),
    rows: machine.odds.settings.map((st) => ({
      setting: `設定${String(st.s)}`,
      values: columns.map((c) => c.value(st) ?? 0),
    })),
  };

  const inputs: SchemaInput[] = [
    { key: "G", label: "総ゲーム数", type: "int", unit: "G", min: 1, max: 50000, step: 1 },
    { key: "BIG", label: bigLabel, type: "int", min: 0, max: 9999, step: 1 },
    ...(regLabel !== null
      ? [{ key: "REG", label: regLabel, type: "int" as const, min: 0, max: 9999, step: 1 }]
      : []),
  ];

  if (extraLabel && machine.odds.settings.some((st) => typeof st.extra === "number")) {
    inputs.push({ key: "EXTRA", label: extraLabel, type: "int", min: 0, max: 9999, step: 1 });
  }

  for (const m of machine.metricsLabels?.extraMetrics ?? []) {
    inputs.push({ key: `EXTRA_${m.id}`, label: m.label, type: "int", min: 0, max: 9999, step: 1 });
  }

  for (const m of machine.metricsLabels?.binomialMetrics ?? []) {
    inputs.push(
      { key: `BIN_TRIALS_${m.id}`, label: m.trialsLabel, type: "int", min: 0, max: 99999, step: 1 },
      { key: `BIN_HITS_${m.id}`, label: m.hitsLabel, type: "int", min: 0, max: 99999, step: 1 },
    );
  }

  if (machine.metricsLabels?.suikaTrialsLabel || machine.metricsLabels?.suikaCzHitsLabel) {
    inputs.push(
      { key: "SUIKA_TRIALS", label: machine.metricsLabels?.suikaTrialsLabel ?? "スイカ回数", type: "int", min: 0, max: 99999, step: 1 },
      { key: "SUIKA_CZ_HITS", label: machine.metricsLabels?.suikaCzHitsLabel ?? "スイカCZ当選回数", type: "int", min: 0, max: 99999, step: 1 },
    );
  }

  if (machine.metricsLabels?.uraAtTrialsLabel || machine.metricsLabels?.uraAtHitsLabel) {
    inputs.push(
      { key: "URA_AT_TRIALS", label: machine.metricsLabels?.uraAtTrialsLabel ?? "裏AT試行回数", type: "int", min: 0, max: 99999, step: 1 },
      { key: "URA_AT_HITS", label: machine.metricsLabels?.uraAtHitsLabel ?? "裏AT当選回数", type: "int", min: 0, max: 99999, step: 1 },
    );
  }

  return NextResponse.json({
    machine: {
      id: machine.id,
      name: machine.name,
      makerName: machine.maker,
    },
    settingsTable,
    inputs,
  });
}
