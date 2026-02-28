/**
 * scripts/seed-stores.ts
 *
 * 全国47都道府県 × 3店舗 = 141件のサンプル店舗を投入。
 * prefecture カラムには slug を格納する（URL整合）。
 *
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

const PREFECTURES: { slug: string; name: string }[] = [
  { slug: "hokkaido", name: "北海道" },
  { slug: "aomori", name: "青森県" },
  { slug: "iwate", name: "岩手県" },
  { slug: "miyagi", name: "宮城県" },
  { slug: "akita", name: "秋田県" },
  { slug: "yamagata", name: "山形県" },
  { slug: "fukushima", name: "福島県" },
  { slug: "ibaraki", name: "茨城県" },
  { slug: "tochigi", name: "栃木県" },
  { slug: "gunma", name: "群馬県" },
  { slug: "saitama", name: "埼玉県" },
  { slug: "chiba", name: "千葉県" },
  { slug: "tokyo", name: "東京都" },
  { slug: "kanagawa", name: "神奈川県" },
  { slug: "niigata", name: "新潟県" },
  { slug: "toyama", name: "富山県" },
  { slug: "ishikawa", name: "石川県" },
  { slug: "fukui", name: "福井県" },
  { slug: "yamanashi", name: "山梨県" },
  { slug: "nagano", name: "長野県" },
  { slug: "gifu", name: "岐阜県" },
  { slug: "shizuoka", name: "静岡県" },
  { slug: "aichi", name: "愛知県" },
  { slug: "mie", name: "三重県" },
  { slug: "shiga", name: "滋賀県" },
  { slug: "kyoto", name: "京都府" },
  { slug: "osaka", name: "大阪府" },
  { slug: "hyogo", name: "兵庫県" },
  { slug: "nara", name: "奈良県" },
  { slug: "wakayama", name: "和歌山県" },
  { slug: "tottori", name: "鳥取県" },
  { slug: "shimane", name: "島根県" },
  { slug: "okayama", name: "岡山県" },
  { slug: "hiroshima", name: "広島県" },
  { slug: "yamaguchi", name: "山口県" },
  { slug: "tokushima", name: "徳島県" },
  { slug: "kagawa", name: "香川県" },
  { slug: "ehime", name: "愛媛県" },
  { slug: "kochi", name: "高知県" },
  { slug: "fukuoka", name: "福岡県" },
  { slug: "saga", name: "佐賀県" },
  { slug: "nagasaki", name: "長崎県" },
  { slug: "kumamoto", name: "熊本県" },
  { slug: "oita", name: "大分県" },
  { slug: "miyazaki", name: "宮崎県" },
  { slug: "kagoshima", name: "鹿児島県" },
  { slug: "okinawa", name: "沖縄県" },
];

const STORE_TEMPLATES = [
  { suffix: "001", tmpl: "{name}サンプルホール駅前店", city: "中央区" },
  { suffix: "002", tmpl: "{name}サンプルホール南口店", city: "南区" },
  { suffix: "003", tmpl: "{name}グランドパーラー本店", city: "北区" },
];

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing DB connection string. Set DATABASE_URL or POSTGRES_URL.");
  }

  const db = createPool({ connectionString });
  console.log("[seed] Seeding 47 × 3 = 141 stores...");

  let count = 0;
  for (const pref of PREFECTURES) {
    for (const t of STORE_TEMPLATES) {
      const id = `${pref.slug}-store-${t.suffix}`;
      const name = t.tmpl.replace("{name}", pref.name);
      const city = t.city;
      const address = `${pref.name}${city}1-1-1`;

      await db.sql`
        INSERT INTO stores (id, name, prefecture, city, address)
        VALUES (${id}, ${name}, ${pref.slug}, ${city}, ${address})
        ON CONFLICT (id) DO UPDATE SET
          name       = EXCLUDED.name,
          prefecture = EXCLUDED.prefecture,
          city       = EXCLUDED.city,
          address    = EXCLUDED.address,
          updated_at = now()
      `;
      count++;
    }
    process.stdout.write(`  ✓ ${pref.name}\n`);
  }

  console.log(`[seed] ${count} stores seeded.`);
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
