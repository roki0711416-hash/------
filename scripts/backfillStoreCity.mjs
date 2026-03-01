/**
 * scripts/backfillStoreCity.mjs
 *
 * city が NULL の店舗に対して、lat/lng から OpenStreetMap Nominatim
 * reverse geocoding で市区町村を補完する。
 *
 * Nominatim 利用ポリシー: 1リクエスト/秒以下
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * 実行: node scripts/backfillStoreCity.mjs [--limit 100] [--dry-run]
 */

import dotenv from "dotenv";
import { createPool } from "@vercel/postgres";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

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

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 200 : 200;

/**
 * Nominatim reverse geocoding
 * @returns {{ city: string|null, address: string|null }}
 */
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=ja&zoom=16`;
  const res = await fetch(url, {
    headers: { "User-Agent": "slokasukun-backfill/1.0" },
  });
  if (!res.ok) {
    console.error(`  Nominatim error: ${res.status} ${res.statusText}`);
    return { city: null, address: null };
  }
  const data = await res.json();
  const addr = data.address || {};

  // 市区町村を抽出 (city / town / village / city_district)
  const city =
    addr.city || addr.town || addr.village || addr.city_district || addr.county || null;

  // 住所を組み立て
  const parts = [];
  if (addr.suburb) parts.push(addr.suburb);
  if (addr.neighbourhood) parts.push(addr.neighbourhood);
  if (addr.road) parts.push(addr.road);
  if (addr.house_number) parts.push(addr.house_number);
  const address = parts.length > 0 ? parts.join(" ") : null;

  return { city, address };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error("[backfill-city] Missing DB connection string.");
    process.exit(1);
  }

  const db = createPool({ connectionString });

  // city が NULL で lat/lng がある店舗を取得
  const { rows } = await db.query(
    `SELECT id, name, lat, lng, city, address
     FROM stores
     WHERE city IS NULL
       AND lat IS NOT NULL
       AND lng IS NOT NULL
       AND source = 'osm'
       AND canonical_store_id IS NULL
     ORDER BY name
     LIMIT $1`,
    [LIMIT],
  );

  console.log(`[backfill-city] Found ${rows.length} stores without city (limit: ${LIMIT})`);
  if (dryRun) console.log("[backfill-city] DRY RUN — no DB writes");

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const store = rows[i];
    try {
      const { city, address } = await reverseGeocode(store.lat, store.lng);

      if (!city) {
        skipped++;
        if (i < 5) console.log(`  [${i + 1}] ${store.name} — no city found`);
        await sleep(1100); // Nominatim rate limit
        continue;
      }

      if (!dryRun) {
        await db.query(
          `UPDATE stores
           SET city = $1,
               address = COALESCE(address, $2),
               updated_at = now()
           WHERE id = $3`,
          [city, address, store.id],
        );
      }
      updated++;
      if (i < 20 || i % 50 === 0) {
        console.log(`  [${i + 1}] ${store.name} → ${city}${address ? ` / ${address}` : ""}`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`  Error on ${store.name}: ${err.message}`);
    }

    // Nominatim rate limit: 1 req/sec
    await sleep(1100);

    if ((i + 1) % 100 === 0) {
      console.log(`  ... ${i + 1} / ${rows.length} processed`);
    }
  }

  console.log(`\n[backfill-city] Done.`);
  console.log(`  Processed: ${rows.length}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Skipped:   ${skipped} (no city from Nominatim)`);
  console.log(`  Errors:    ${errors}`);

  // 残り件数
  const remaining = await db.query(
    `SELECT count(*)::int AS cnt FROM stores
     WHERE city IS NULL AND lat IS NOT NULL AND source = 'osm' AND canonical_store_id IS NULL`,
  );
  console.log(`  Remaining: ${remaining.rows[0].cnt} stores without city`);

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
