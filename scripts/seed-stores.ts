/**
 * scripts/seed-stores.ts
 *
 * 開発用: サンプル店舗を投入するシードスクリプト。
 * 実行: npx tsx scripts/seed-stores.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import { createPool } from "@vercel/postgres";

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

const SAMPLE_STORES = [
  {
    id: "store_tokyo_001",
    name: "サンプルホールA",
    prefecture: "東京都",
    city: "新宿区",
    address: "東京都新宿区歌舞伎町1-1-1",
  },
  {
    id: "store_tokyo_002",
    name: "サンプルホールB",
    prefecture: "東京都",
    city: "渋谷区",
    address: "東京都渋谷区道玄坂2-2-2",
  },
  {
    id: "store_tokyo_003",
    name: "サンプルホールC",
    prefecture: "東京都",
    city: "池袋",
    address: "東京都豊島区東池袋3-3-3",
  },
  {
    id: "store_osaka_001",
    name: "サンプルホールD",
    prefecture: "大阪府",
    city: "大阪市",
    address: "大阪府大阪市中央区難波5-5-5",
  },
];

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing DB connection string.");
  }

  const db = createPool({ connectionString });

  for (const store of SAMPLE_STORES) {
    await db.sql`
      INSERT INTO stores (id, name, prefecture, city, address)
      VALUES (${store.id}, ${store.name}, ${store.prefecture}, ${store.city}, ${store.address})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        prefecture = EXCLUDED.prefecture,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        updated_at = now()
    `;
    console.log(`  ✓ ${store.name} (${store.prefecture})`);
  }

  console.log(`[seed] ${SAMPLE_STORES.length} stores seeded.`);
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
