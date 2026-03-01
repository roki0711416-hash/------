/**
 * scripts/fetchOsmPachinko.ts
 *
 * Overpass API から日本全国のパチンコホールデータを1回取得し、
 * data/osm/pachinko_raw.json に保存する。
 *
 * 実行: npx tsx scripts/fetchOsmPachinko.ts
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import {
  PACHINKO_MAIN_QUERY,
  DEFAULT_OVERPASS_URL,
} from "./osm/overpassQueries";

const OVERPASS_URL = process.env.OVERPASS_URL || DEFAULT_OVERPASS_URL;
const MAX_RETRIES = 3;
const OUT_DIR = path.join(process.cwd(), "data", "osm");
const OUT_FILE = path.join(OUT_DIR, "pachinko_raw.json");

/* ── 指数バックオフ付きfetch ── */
async function fetchWithRetry(url: string, body: string): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[fetch] Attempt ${attempt}/${MAX_RETRIES} ...`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(body)}`,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "(no body)");
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[fetch] Attempt ${attempt} failed: ${msg}`);
      if (attempt < MAX_RETRIES) {
        const wait = 2 ** attempt * 1000; // 2s, 4s, 8s
        console.log(`[fetch] Waiting ${wait / 1000}s before retry...`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw new Error(`All ${MAX_RETRIES} attempts failed. Last error: ${msg}`);
      }
    }
  }
  throw new Error("unreachable");
}

/* ── メイン ── */
async function main() {
  console.log(`[osm:fetch] Overpass URL: ${OVERPASS_URL}`);
  console.log(`[osm:fetch] Query:\n${PACHINKO_MAIN_QUERY}\n`);

  const startMs = Date.now();
  const data = (await fetchWithRetry(OVERPASS_URL, PACHINKO_MAIN_QUERY)) as {
    elements?: Array<{ type: string; tags?: Record<string, string> }>;
  };
  const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);

  const elements = data.elements ?? [];
  console.log(`[osm:fetch] Done in ${elapsedSec}s — ${elements.length} elements`);

  // 簡易サマリ
  const byType: Record<string, number> = {};
  let withName = 0;
  let withoutName = 0;
  for (const el of elements) {
    byType[el.type] = (byType[el.type] ?? 0) + 1;
    if (el.tags?.name) withName++;
    else withoutName++;
  }
  console.log(`[osm:fetch] Breakdown by type:`);
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t}: ${c}`);
  }
  console.log(`[osm:fetch] name あり: ${withName}, name なし: ${withoutName}`);

  // 保存
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[osm:fetch] Saved to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
