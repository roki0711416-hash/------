import { analyzeSlumpDecision, normalizeSlumpLine, type SlumpAnalyzeInput } from "./slumpAnalyze";
import { computeSlumpMetrics } from "./slumpMetrics";
import { parseMachineType, type MachineType } from "./slumpTypes";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function parsePoint(v: unknown) {
  if (!isObject(v)) return null;
  const x = v.x;
  const y = v.y;
  if (!isFiniteNumber(x) || !isFiniteNumber(y)) return null;
  return { x, y };
}

export type SlumpAnalyzeParsed = SlumpAnalyzeInput & { machineType: MachineType };

export function parseSlumpAnalyzePayload(payload: unknown): SlumpAnalyzeParsed | { error: string } {
  if (!isObject(payload)) return { error: "Invalid payload" };

  const machineType = parseMachineType(payload.machineType);
  if (!machineType) return { error: "machineType must be juggler/hanahana/smartAT" };

  const pointsRaw = payload.points;
  if (!isObject(pointsRaw)) return { error: "points is required" };

  const start = parsePoint(pointsRaw.start);
  const end = parsePoint(pointsRaw.end);
  const yMax = pointsRaw.yMax;
  const yMin = pointsRaw.yMin;

  if (!start || !end) return { error: "points.start/end must be {x,y}" };
  if (!isFiniteNumber(yMax) || !isFiniteNumber(yMin) || yMax === yMin)
    return { error: "points.yMax/yMin must be numbers and not equal" };

  const slumpLineRaw = payload.slumpLine;
  if (!Array.isArray(slumpLineRaw)) return { error: "slumpLine must be an array" };

  const slumpLine = slumpLineRaw
    .map((p) => parsePoint(p))
    .filter((p): p is { x: number; y: number } => !!p);

  if (slumpLine.length < 2) return { error: "slumpLine must have at least 2 valid points" };

  const spinsRaw = payload.spins;
  let spins: number | undefined;
  if (spinsRaw !== undefined) {
    const v = Number(spinsRaw);
    if (!Number.isFinite(v) || v <= 0) return { error: "spins must be a positive number" };
    spins = v;
  }

  return {
    machineType,
    points: { start, end, yMax, yMin },
    slumpLine,
    spins,
  };
}

export function runSlumpAnalyze(parsed: SlumpAnalyzeParsed) {
  const series = normalizeSlumpLine(parsed);
  const metrics = computeSlumpMetrics(series.diffCoins);
  const decision = analyzeSlumpDecision(parsed.machineType, series, metrics, parsed.spins);
  return { series, metrics, decision };
}
