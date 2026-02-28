// community_reports テーブルに action_taken カラムを追加
// 管理者がどのアクションを実行したかを記録する（delete_content, ban_user, unban_user）
import { createPool } from "@vercel/postgres";

async function main() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL ?? process.env.DATABASE_URL,
  });

  console.log("Adding action_taken column to community_reports...");

  await pool.sql`
    ALTER TABLE community_reports
    ADD COLUMN IF NOT EXISTS action_taken TEXT
  `;

  console.log("✅ action_taken column added");

  // 既存の RESOLVED レポートに action_taken をバックフィル
  // （これまでの RESOLVED は delete_content アクションのみだった）
  const { rowCount } = await pool.sql`
    UPDATE community_reports
    SET action_taken = 'delete_content'
    WHERE status = 'RESOLVED' AND action_taken IS NULL
  `;
  console.log(`✅ Backfilled ${rowCount} existing RESOLVED reports`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
