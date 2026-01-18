// Verifies that /api/slump/analyze (canonical) and /api/slump-graph/analyze (JSON proxy mode)
// return consistent results for the same canonical payload across machineType variants.
//
// Usage:
//   1) npm run dev:local
//   2) node scripts/verify-slump-proxy.mjs

const BASE_URL = process.env.SLOKASU_BASE_URL || "http://localhost:3000";

function approxEqual(a, b, eps = 1e-12) {
  return Math.abs(a - b) <= eps;
}

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function samplePayload(machineType) {
  // 5 points with a gentle downtrend and a small bounce.
  // Coordinates are arbitrary pixels; yMax/yMin define axis range (coins).
  return {
    machineType,
    points: {
      start: { x: 0, y: 100 },
      end: { x: 400, y: 210 },
      yMax: 2000,
      yMin: -2000,
    },
    slumpLine: [
      { x: 0, y: 100 },
      { x: 100, y: 140 },
      { x: 200, y: 190 },
      { x: 300, y: 235 },
      { x: 400, y: 210 },
    ],
    spins: 1200,
  };
}

async function main() {
  const machineTypes = ["juggler", "hanahana", "smartAT"];
  let failed = 0;

  for (const mt of machineTypes) {
    const payload = samplePayload(mt);

    const a = await postJson("/api/slump/analyze", payload);
    const b = await postJson("/api/slump-graph/analyze", payload);

    if (!a.ok) {
      console.error(`[FAIL] /api/slump/analyze (${mt}) status=${a.status}`, a.data);
      failed += 1;
      continue;
    }
    if (!b.ok) {
      console.error(`[FAIL] /api/slump-graph/analyze (${mt}) status=${b.status}`, b.data);
      failed += 1;
      continue;
    }

    const ax = Number(a.data?.biasZ);
    const ac = Number(a.data?.graphConfidence);
    const ah = String(a.data?.decisionHint ?? "");

    const bx = Number(b.data?.biasZ);
    const bc = Number(b.data?.graphConfidence);
    const bh = String(b.data?.decisionHint ?? "");

    const ok =
      Number.isFinite(ax) &&
      Number.isFinite(ac) &&
      Number.isFinite(bx) &&
      Number.isFinite(bc) &&
      approxEqual(ax, bx) &&
      approxEqual(ac, bc) &&
      ah === bh;

    if (!ok) {
      console.error(`[MISMATCH] ${mt}`);
      console.error("  /api/slump/analyze      ", { biasZ: ax, graphConfidence: ac, decisionHint: ah });
      console.error("  /api/slump-graph/analyze", { biasZ: bx, graphConfidence: bc, decisionHint: bh });
      failed += 1;
    } else {
      console.log(`[OK] ${mt} biasZ=${ax.toFixed(6)} conf=${ac.toFixed(6)} hint=${ah}`);
    }
  }

  if (failed > 0) {
    console.error(`\nFAILED: ${failed} case(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll cases matched.");
  }
}

main().catch((e) => {
  console.error("Unexpected error", e);
  process.exitCode = 1;
});
