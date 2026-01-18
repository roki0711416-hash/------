import { NextResponse } from "next/server";
import { parseSlumpAnalyzePayload, runSlumpAnalyze } from "../../../../utils/slumpApi";

export const runtime = "nodejs";

function isSlumpCorrectionEnabled() {
  // Temporarily keep this feature non-public in production.
  // Allow manual override via env when needed.
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.SLOKASU_ENABLE_SLUMP_CORRECTION === "1"
  );
}

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!isSlumpCorrectionEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const parsed = parseSlumpAnalyzePayload(payload);
  if ("error" in parsed) return jsonError(400, parsed.error);

  try {
    const { metrics, decision } = runSlumpAnalyze(parsed);

    return NextResponse.json({
      metrics,
      biasZ: decision.biasZ,
      graphConfidence: decision.graphConfidence,
      decisionHint: decision.decisionHint,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to analyze";
    // Most errors here are validation/normalization related.
    return jsonError(400, msg);
  }
}
