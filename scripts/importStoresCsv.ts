/**
 * scripts/importStoresCsv.ts
 *
 * CSVファイルから店舗データを一括インポート。
 *
 * CSV列: external_id,name,prefecture_slug,prefecture_name,city,address,lat,lng
 *
 * upsert 戦略:
 *   - external_id がある行 → external_id を id として使用
 *   - external_id が空 → (name + prefecture_slug + address) の SHA-1 ハッシュを id に生成
 *   → ON CONFLICT (id) DO UPDATE で冪等 upsert
 *
 * 実行:
 *   npx tsx scripts/importStoresCsv.ts                         # data/stores_master.csv
 *   npx tsx scripts/importStoresCsv.ts data/stores_master.sample.csv  # 指定ファイル
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import { createPool } from "@vercel/postgres";

/* ── 都道府県slug検証 ── */
const VALID_SLUGS = new Set([
  "hokkaido","aomori","iwate","miyagi","akita","yamagata","fukushima",
  "ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",
  "niigata","toyama","ishikawa","fukui","yamanashi","nagano","gifu","shizuoka","aichi",
  "mie","shiga","kyoto","osaka","hyogo","nara","wakayama",
  "tottori","shimane","okayama","hiroshima","yamaguchi",
  "tokushima","kagawa","ehime","kochi",
  "fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima","okinawa",
]);

/* ── CSV パーサ（簡易・ダブルクォート対応） ── */
function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  cols.push(cur);
  return cols;
}

/* ── ID生成 ── */
function generateStoreId(name: string, prefSlug: string, address: string): string {
  const raw = `${name}|${prefSlug}|${address}`;
  return crypto.createHash("sha1").update(raw, "utf-8").digest("hex").slice(0, 24);
}

/* ── DB接続 ── */
function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

/* ── メイン ── */
interface RowError {
  line: number;
  reason: string;
  raw: string;
}

async function main() {
  // --source=osm などの引数
  const sourceArg = process.argv.find((a) => a.startsWith("--source="));
  const source = sourceArg ? sourceArg.split("=")[1] : "manual";

  const csvPath = process.argv.filter((a) => !a.startsWith("--"))[2]
    ? path.resolve(process.argv.filter((a) => !a.startsWith("--"))[2])
    : path.join(process.cwd(), "data", "stores_master.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`[import] CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error("[import] Missing DB connection string.");
    process.exit(1);
  }

  const db = createPool({ connectionString });
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    console.error("[import] CSV has no data rows.");
    process.exit(1);
  }

  // ヘッダー検証
  const header = parseCSVLine(lines[0]);
  const expected = ["external_id", "name", "prefecture_slug", "prefecture_name", "city", "address", "lat", "lng"];
  const headerNorm = header.map((h) => h.trim().toLowerCase());
  if (headerNorm.join(",") !== expected.join(",")) {
    console.error(`[import] Invalid CSV header.`);
    console.error(`  Expected: ${expected.join(",")}`);
    console.error(`  Got:      ${headerNorm.join(",")}`);
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: RowError[] = [];

  console.log(`[import] Processing ${lines.length - 1} rows from ${csvPath} ...`);

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const cols = parseCSVLine(raw);

    // 列数チェック
    if (cols.length < 8) {
      errors.push({ line: i + 1, reason: `列数不足 (${cols.length} < 8)`, raw });
      skipped++;
      continue;
    }

    const [externalIdRaw, name, prefSlug, prefName, city, address, latStr, lngStr] = cols.map(
      (c) => c.trim(),
    );

    // 必須チェック
    if (!name) {
      errors.push({ line: i + 1, reason: "name が空", raw });
      skipped++;
      continue;
    }
    if (!prefSlug) {
      errors.push({ line: i + 1, reason: "prefecture_slug が空", raw });
      skipped++;
      continue;
    }
    if (!prefName) {
      errors.push({ line: i + 1, reason: "prefecture_name が空", raw });
      skipped++;
      continue;
    }

    // slug 検証
    if (!VALID_SLUGS.has(prefSlug)) {
      errors.push({ line: i + 1, reason: `不正な prefecture_slug: "${prefSlug}"`, raw });
      skipped++;
      continue;
    }

    // ID決定
    const externalId = externalIdRaw || null;
    const id = externalId ?? generateStoreId(name, prefSlug, address);

    // lat/lng パース
    const lat = latStr ? parseFloat(latStr) : null;
    const lng = lngStr ? parseFloat(lngStr) : null;
    if (latStr && isNaN(lat!)) {
      errors.push({ line: i + 1, reason: `lat が数値でない: "${latStr}"`, raw });
      skipped++;
      continue;
    }
    if (lngStr && isNaN(lng!)) {
      errors.push({ line: i + 1, reason: `lng が数値でない: "${lngStr}"`, raw });
      skipped++;
      continue;
    }

    try {
      // upsert — xmax = 0 なら INSERT、そうでなければ UPDATE を判定
      const res = await db.sql`
        INSERT INTO stores (id, external_id, name, prefecture, prefecture_name, city, address, lat, lng, source, imported_at)
        VALUES (
          ${id},
          ${externalId},
          ${name},
          ${prefSlug},
          ${prefName},
          ${city || null},
          ${address || null},
          ${lat},
          ${lng},
          ${source},
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          external_id     = COALESCE(EXCLUDED.external_id, stores.external_id),
          name            = EXCLUDED.name,
          prefecture      = EXCLUDED.prefecture,
          prefecture_name = COALESCE(EXCLUDED.prefecture_name, stores.prefecture_name),
          city            = EXCLUDED.city,
          address         = EXCLUDED.address,
          lat             = EXCLUDED.lat,
          lng             = EXCLUDED.lng,
          source          = EXCLUDED.source,
          imported_at     = now(),
          updated_at      = now()
        RETURNING (xmax = 0) AS is_insert
      `;
      const isInsert = res.rows[0]?.is_insert;
      if (isInsert) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ line: i + 1, reason: `DB error: ${msg}`, raw });
      skipped++;
    }

    // 進捗ログ
    const processed = i;
    if (processed % 1000 === 0) {
      console.log(`  ... ${processed} / ${lines.length - 1} rows processed`);
    }
  }

  console.log(`\n[import] Done.`);
  console.log(`  Total rows:  ${lines.length - 1}`);
  console.log(`  Inserted:    ${inserted}`);
  console.log(`  Updated:     ${updated}`);
  console.log(`  Skipped/Err: ${skipped}`);

  if (errors.length > 0) {
    console.log(`\n[import] Errors:`);
    for (const e of errors) {
      console.log(`  L${e.line}: ${e.reason}`);
    }
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
