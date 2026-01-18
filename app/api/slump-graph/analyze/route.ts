import { NextResponse } from "next/server";
import { analyzeSlumpGraph, type SlumpGraphInput } from "../../../../lib/slumpGraph";
import { parseSlumpAnalyzePayload, runSlumpAnalyze } from "../../../../utils/slumpApi";
import { parseMachineType } from "../../../../utils/slumpTypes";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function POST(req: Request) {
  // MVP: accept multipart/form-data (optionally includes image), but analyze based on tap inputs.
  let payloadRaw: unknown;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    const payloadStr = fd.get("payload");
    if (typeof payloadStr !== "string" || !payloadStr) {
      return jsonError(400, "Missing payload");
    }
    try {
      payloadRaw = JSON.parse(payloadStr);
    } catch {
      return jsonError(400, "Invalid payload JSON");
    }
  } else {
    try {
      payloadRaw = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON");
    }
  }

  if (!isObject(payloadRaw)) return jsonError(400, "Invalid payload");

  // Optional proxy mode: allow callers to use the canonical slump analyzer schema via this legacy endpoint.
  // This does NOT affect the current UI, which posts multipart/form-data.
  if (!contentType.includes("multipart/form-data") && "machineType" in payloadRaw) {
    // Quick gate to avoid parsing work for clearly invalid values.
    const machineType = parseMachineType((payloadRaw as Record<string, unknown>).machineType);
    if (machineType) {
      const parsed = parseSlumpAnalyzePayload(payloadRaw);
      if ("error" in parsed) return jsonError(400, parsed.error);
      try {
        const { decision } = runSlumpAnalyze(parsed);
        return NextResponse.json({
          biasZ: decision.biasZ,
          graphConfidence: decision.graphConfidence,
          decisionHint: decision.decisionHint,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to analyze";
        return jsonError(400, msg);
      }
    }
  }

  const kind = payloadRaw.kind;
  const start = payloadRaw.start;
  const end = payloadRaw.end;
  const yTop = payloadRaw.yTop;
  const yBottom = payloadRaw.yBottom;
  const spinsRaw = payloadRaw.spins;

  if (kind !== "jugg" && kind !== "hanahana" && kind !== "smart-at") {
    return jsonError(400, "kind must be jugg/hanahana/smart-at");
  }
  if (!isObject(start) || !isObject(end) || !isObject(yTop) || !isObject(yBottom)) {
    return jsonError(400, "Missing points");
  }

  const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v));

  let spins: number | undefined;
  if (spinsRaw !== undefined) {
    const v = toNum(spinsRaw);
    if (!Number.isFinite(v) || v <= 0) return jsonError(400, "spins must be a positive number");
    spins = v;
  }

  const input: SlumpGraphInput = {
    kind,
    start: { x: toNum(start.x), y: toNum(start.y) },
    end: { x: toNum(end.x), y: toNum(end.y) },
    yTop: { y: toNum(yTop.y), value: toNum(yTop.value) },
    yBottom: { y: toNum(yBottom.y), value: toNum(yBottom.value) },
    spins,
  };

  const allNums = [
    input.start.x,
    input.start.y,
    input.end.x,
    input.end.y,
    input.yTop.y,
    input.yTop.value,
    input.yBottom.y,
    input.yBottom.value,
  ];
  if (!allNums.every((n) => Number.isFinite(n))) {
    return jsonError(400, "All coordinates/values must be numbers");
  }

  const out = analyzeSlumpGraph(input);
  return NextResponse.json(out);
}
