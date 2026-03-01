/**
 * lib/jobs/jobLock.ts
 *
 * DB ベースのジョブロック。多重実行を防止する。
 * locked_at が 30分以内なら「すでに実行中」として弾く。
 */

import { getDb } from "../db";

const LOCK_TTL_MS = 30 * 60 * 1000; // 30分

export interface JobResult<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
  skipped?: boolean;
}

/**
 * ロックを取得して fn を実行する。
 * - lockedAt が 30分以内 → { ok: false, skipped: true } を返す
 * - fn 実行後は finally でロック解放
 */
export async function runWithLock<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<JobResult<T>> {
  const db = getDb();
  if (!db) return { ok: false, error: "DB not configured" };

  // ロック取得を試みる（CAS: lockedAt が null もしくは 30分以上前ならセット）
  const threshold = new Date(Date.now() - LOCK_TTL_MS).toISOString();
  const { rowCount } = await db.sql`
    UPDATE job_locks
    SET locked_at = now(), updated_at = now()
    WHERE name = ${name}
      AND (locked_at IS NULL OR locked_at < ${threshold}::timestamptz)
  `;

  if (!rowCount || rowCount === 0) {
    // 行が存在しない場合は INSERT して再試行
    await db.sql`
      INSERT INTO job_locks (name, locked_at, updated_at)
      VALUES (${name}, NULL, now())
      ON CONFLICT (name) DO NOTHING
    `;
    const retry = await db.sql`
      UPDATE job_locks
      SET locked_at = now(), updated_at = now()
      WHERE name = ${name}
        AND (locked_at IS NULL OR locked_at < ${threshold}::timestamptz)
    `;
    if (!retry.rowCount || retry.rowCount === 0) {
      console.info(`[job:${name}] Already running (lock held). Skipping.`);
      return { ok: false, skipped: true, error: "Already running" };
    }
  }

  console.info(`[job:${name}] Lock acquired. Starting...`);

  try {
    const result = await fn();
    console.info(`[job:${name}] Completed successfully.`);
    return { ok: true, result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[job:${name}] Failed: ${msg}`);
    return { ok: false, error: msg };
  } finally {
    // ロック解放
    await db.sql`
      UPDATE job_locks
      SET locked_at = NULL, updated_at = now()
      WHERE name = ${name}
    `;
    console.info(`[job:${name}] Lock released.`);
  }
}
