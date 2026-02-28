/**
 * scripts/osm/generateCoverageReport.ts
 *
 * data/osm/prefecture_counts.json を読み込み、
 * カバレッジレポートと低カバレッジ県リストを生成する。
 *
 * 出力:
 *   data/osm/coverage_report.md
 *   data/osm/low_coverage_prefectures.csv
 *
 * 実行: npx tsx scripts/osm/generateCoverageReport.ts
 */

import fs from "fs";
import path from "path";

/* ── 都道府県マスタ ── */
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
const slugToName = new Map(PREFECTURES.map((p) => [p.slug, p.name]));

/* ── メイン ── */
function main() {
  const dataDir = path.join(process.cwd(), "data", "osm");
  const countsPath = path.join(dataDir, "prefecture_counts.json");

  if (!fs.existsSync(countsPath)) {
    console.error(`[report] Not found: ${countsPath}`);
    console.error("Run 'npx tsx scripts/osm/normalizeAndSummarize.ts' first.");
    process.exit(1);
  }

  const countsRaw: Record<string, number> = JSON.parse(
    fs.readFileSync(countsPath, "utf-8"),
  );

  // unmapped数
  const unmappedCount = countsRaw["__unmapped__"] ?? 0;

  // 都道府県だけのカウント（47県）
  const prefCounts: { slug: string; name: string; count: number }[] = [];
  for (const p of PREFECTURES) {
    prefCounts.push({ slug: p.slug, name: p.name, count: countsRaw[p.slug] ?? 0 });
  }
  prefCounts.sort((a, b) => b.count - a.count);

  const total = Object.values(countsRaw).reduce((s, c) => s + c, 0);
  const totalMapped = prefCounts.reduce((s, p) => s + p.count, 0);

  // 中央値
  const sortedCounts = prefCounts.map((p) => p.count).sort((a, b) => a - b);
  const median = sortedCounts[Math.floor(sortedCounts.length / 2)];

  // missing_name count
  const missingNamePath = path.join(dataDir, "missing_name.csv");
  let missingNameCount = 0;
  if (fs.existsSync(missingNamePath)) {
    const lines = fs.readFileSync(missingNamePath, "utf-8").split("\n").filter((l) => l.trim());
    missingNameCount = Math.max(0, lines.length - 1); // minus header
  }

  // 低カバレッジ判定
  const THRESHOLD_ABS = 50;
  const thresholdMedian = Math.floor(median / 3);
  const lowAbs = prefCounts.filter((p) => p.count < THRESHOLD_ABS);
  const lowMedian = prefCounts.filter((p) => p.count < thresholdMedian);

  // 両方を union
  const lowSet = new Set([...lowAbs.map((p) => p.slug), ...lowMedian.map((p) => p.slug)]);
  const lowAll = prefCounts.filter((p) => lowSet.has(p.slug)).sort((a, b) => a.count - b.count);

  // ── low_coverage_prefectures.csv ──
  const lowCsvLines = ["prefecture_slug,prefecture_name,count,reason"];
  for (const p of lowAll) {
    const reasons: string[] = [];
    if (p.count < THRESHOLD_ABS) reasons.push(`<${THRESHOLD_ABS}`);
    if (p.count < thresholdMedian) reasons.push(`<median/3(${thresholdMedian})`);
    lowCsvLines.push(`${p.slug},${p.name},${p.count},${reasons.join("+")}`);
  }
  fs.writeFileSync(
    path.join(dataDir, "low_coverage_prefectures.csv"),
    lowCsvLines.join("\n") + "\n",
    "utf-8",
  );

  // ── coverage_report.md ──
  const top10 = prefCounts.slice(0, 10);
  const bottom10 = [...prefCounts].sort((a, b) => a.count - b.count).slice(0, 10);

  const lines: string[] = [];
  lines.push("# OSM パチンコホール カバレッジレポート");
  lines.push("");
  lines.push(`生成日: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## サマリ");
  lines.push("");
  lines.push(`| 項目 | 件数 |`);
  lines.push(`|------|------|`);
  lines.push(`| 全取得件数 | ${total} |`);
  lines.push(`| 都道府県判明 | ${totalMapped} |`);
  lines.push(`| 都道府県不明 (unmapped) | ${unmappedCount} |`);
  lines.push(`| name 無し | ${missingNameCount} |`);
  lines.push(`| 都道府県中央値 | ${median} |`);
  lines.push("");

  lines.push("## 都道府県別件数 TOP 10");
  lines.push("");
  lines.push("| # | 都道府県 | 件数 |");
  lines.push("|---|----------|------|");
  top10.forEach((p, i) => {
    lines.push(`| ${i + 1} | ${p.name} | ${p.count} |`);
  });
  lines.push("");

  lines.push("## 都道府県別件数 ワースト 10");
  lines.push("");
  lines.push("| # | 都道府県 | 件数 |");
  lines.push("|---|----------|------|");
  bottom10.forEach((p, i) => {
    lines.push(`| ${i + 1} | ${p.name} | ${p.count} |`);
  });
  lines.push("");

  lines.push("## 低カバレッジ県一覧");
  lines.push("");
  lines.push(`判定基準: (A) ${THRESHOLD_ABS}件未満 または (B) 中央値(${median})の1/3(=${thresholdMedian})未満`);
  lines.push("");
  if (lowAll.length === 0) {
    lines.push("該当なし");
  } else {
    lines.push("| 都道府県 | 件数 | 理由 |");
    lines.push("|----------|------|------|");
    for (const p of lowAll) {
      const reasons: string[] = [];
      if (p.count < THRESHOLD_ABS) reasons.push(`${THRESHOLD_ABS}件未満`);
      if (p.count < thresholdMedian) reasons.push(`中央値1/3未満`);
      lines.push(`| ${p.name} | ${p.count} | ${reasons.join(", ")} |`);
    }
  }
  lines.push("");

  lines.push("## 補完戦略（提案）");
  lines.push("");
  lines.push("### 1. 住所欠損の補完（逆ジオコーディング）");
  lines.push("");
  lines.push("unmapped（都道府県不明）のレコードは lat/lng を持っているため、");
  lines.push("逆ジオコーディング（Nominatim等）で都道府県を推定できます。");
  lines.push("");
  lines.push("```");
  lines.push("# 例: Nominatim reverse");
  lines.push("GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json");
  lines.push("→ address.province に都道府県が入る");
  lines.push("```");
  lines.push("");
  lines.push("### 2. タグ取りこぼし対策");
  lines.push("");
  lines.push("現在のクエリは `leisure=adult_gaming_centre` と `gambling=pachinko` を取得しています。");
  lines.push("追加で以下のタグも検討してください：");
  lines.push("");
  lines.push("- `amenity=gambling`");
  lines.push("- `shop=gambling` + name にパチンコ関連語を含むもの");
  lines.push("- `gambling=slot_machines`（スロット専門店）");
  lines.push("");
  lines.push("### 3. ユーザー投稿 / 運営手動追加");
  lines.push("");
  lines.push("CSVインポーター（`scripts/importStoresCsv.ts`）が既に存在するため、");
  lines.push("低カバレッジ県のデータは手動CSV追記で補完できます。");
  lines.push("");
  lines.push("```bash");
  lines.push("# data/stores_master.csv に行を追加して再投入");
  lines.push("npx tsx scripts/importStoresCsv.ts");
  lines.push("```");
  lines.push("");
  lines.push("### 4. データソース分散");
  lines.push("");
  lines.push("許諾の取れる公開データ（例: 各都道府県の営業許可リスト）を");
  lines.push("見つけた県から順に追加していく戦略も有効です。");
  lines.push("各県の公安委員会が公表しているパチンコ営業許可リストを確認してください。");
  lines.push("");

  // 全県一覧（参考）
  lines.push("## 全都道府県一覧（参考）");
  lines.push("");
  lines.push("| 都道府県 | slug | 件数 |");
  lines.push("|----------|------|------|");
  for (const p of prefCounts) {
    lines.push(`| ${p.name} | ${p.slug} | ${p.count} |`);
  }
  lines.push("");

  const report = lines.join("\n");
  fs.writeFileSync(path.join(dataDir, "coverage_report.md"), report, "utf-8");

  // ログ
  console.log(`[report] Coverage report written.`);
  console.log(`  Total: ${total} | Mapped: ${totalMapped} | Unmapped: ${unmappedCount} | No-name: ${missingNameCount}`);
  console.log(`  Median: ${median} | Low-coverage threshold: <${THRESHOLD_ABS} or <${thresholdMedian}`);
  console.log(`  Low-coverage prefectures: ${lowAll.length}`);
  for (const p of lowAll) {
    console.log(`    ${p.name}: ${p.count}`);
  }
}

main();
