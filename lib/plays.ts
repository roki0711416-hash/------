import { getPool, mustGetPool } from "./db";
import { randomToken, randomUuid } from "./crypto";

let ensurePlaysTablePromise: Promise<void> | null = null;

type DbPool = ReturnType<typeof mustGetPool>;

async function ensurePlaysTable(db: DbPool) {
  if (!ensurePlaysTablePromise) {
    ensurePlaysTablePromise = (async () => {
      await db.sql`
        CREATE TABLE IF NOT EXISTS plays (
          id uuid PRIMARY KEY,
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          machine_id text NOT NULL,
          machine_name text NOT NULL,
          machine_no int NULL,
          store_name text NULL,
          played_on date NOT NULL,
          total_games int NULL,
          big_count int NULL,
          reg_count int NULL,
          diff_coins int NULL,
          invest_yen int NULL,
          return_yen int NULL,
          memo text NULL,
          image_url text NULL,
          share_token text NOT NULL UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `;

      await db.sql`
        CREATE INDEX IF NOT EXISTS plays_user_time_idx
        ON plays (user_id, played_on DESC, created_at DESC);
      `;
    })();
  }
  await ensurePlaysTablePromise;
}

export type Play = {
  id: string;
  userId: string;
  machineId: string;
  machineName: string;
  machineNo: number | null;
  storeName: string | null;
  playedOn: string; // YYYY-MM-DD
  totalGames: number | null;
  bigCount: number | null;
  regCount: number | null;
  diffCoins: number | null;
  investYen: number | null;
  returnYen: number | null;
  memo: string | null;
  imageUrl: string | null;
  shareToken: string;
  createdAt: string;
};

function parseNullableInt(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  return i;
}

function parseNullableText(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

export type CreatePlayInput = {
  userId: string;
  machineId: string;
  machineName: string;
  machineNo: number | null;
  storeName: string | null;
  playedOn: string;
  totalGames: number | null;
  bigCount: number | null;
  regCount: number | null;
  diffCoins: number | null;
  investYen: number | null;
  returnYen: number | null;
  memo: string | null;
  imageUrl: string | null;
};

export function createPlayInputFromFormData(fd: FormData): CreatePlayInput | null {
  const machineId = String(fd.get("machineId") ?? "").trim();
  const playedOn = String(fd.get("playedOn") ?? "").trim();

  if (!machineId) return null;
  // YYYY-MM-DD だけ許可（date input 想定）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return null;

  return {
    userId: String(fd.get("userId") ?? "").trim(),
    machineId,
    machineName: "",
    machineNo: parseNullableInt(fd.get("machineNo")),
    storeName: parseNullableText(fd.get("storeName")),
    playedOn,
    totalGames: parseNullableInt(fd.get("totalGames")),
    bigCount: parseNullableInt(fd.get("bigCount")),
    regCount: parseNullableInt(fd.get("regCount")),
    diffCoins: parseNullableInt(fd.get("diffCoins")),
    investYen: parseNullableInt(fd.get("investYen")),
    returnYen: parseNullableInt(fd.get("returnYen")),
    memo: parseNullableText(fd.get("memo")),
    imageUrl: parseNullableText(fd.get("imageUrl")),
  };
}

export async function insertPlay(input: CreatePlayInput): Promise<{ id: string; shareToken: string }> {
  const db = mustGetPool();
  const id = randomUuid();
  const shareToken = randomToken(18);

  try {
    await db.sql`
      INSERT INTO plays (
        id,
        user_id,
        machine_id,
        machine_name,
        machine_no,
        store_name,
        played_on,
        total_games,
        big_count,
        reg_count,
        diff_coins,
        invest_yen,
        return_yen,
        memo,
        image_url,
        share_token
      ) VALUES (
        ${id},
        ${input.userId}::uuid,
        ${input.machineId},
        ${input.machineName},
        ${input.machineNo},
        ${input.storeName},
        ${input.playedOn},
        ${input.totalGames},
        ${input.bigCount},
        ${input.regCount},
        ${input.diffCoins},
        ${input.investYen},
        ${input.returnYen},
        ${input.memo},
        ${input.imageUrl},
        ${shareToken}
      )
    `;
  } catch (e: unknown) {
    if (isUndefinedTableError(e)) {
      await ensurePlaysTable(db);
      await db.sql`
        INSERT INTO plays (
          id,
          user_id,
          machine_id,
          machine_name,
          machine_no,
          store_name,
          played_on,
          total_games,
          big_count,
          reg_count,
          diff_coins,
          invest_yen,
          return_yen,
          memo,
          image_url,
          share_token
        ) VALUES (
          ${id},
          ${input.userId}::uuid,
          ${input.machineId},
          ${input.machineName},
          ${input.machineNo},
          ${input.storeName},
          ${input.playedOn},
          ${input.totalGames},
          ${input.bigCount},
          ${input.regCount},
          ${input.diffCoins},
          ${input.investYen},
          ${input.returnYen},
          ${input.memo},
          ${input.imageUrl},
          ${shareToken}
        )
      `;
    } else {
      throw e;
    }
  }

  return { id, shareToken };
}

function isUndefinedTableError(e: unknown): boolean {
  const code = (e as { code?: unknown } | null)?.code;
  if (code === "42P01") return true; // undefined_table
  const msg = (e as { message?: unknown } | null)?.message;
  return typeof msg === "string" && msg.includes('relation "plays" does not exist');
}

export async function listPlaysForUser(userId: string, limit = 50): Promise<Play[]> {
  const db = getPool();
  if (!db) return [];

  let rows: unknown[] = [];
  try {
    const res = await db.sql`
      SELECT
        id,
        user_id,
        machine_id,
        machine_name,
        machine_no,
        store_name,
        played_on,
        total_games,
        big_count,
        reg_count,
        diff_coins,
        invest_yen,
        return_yen,
        memo,
        image_url,
        share_token,
        created_at
      FROM plays
      WHERE user_id = ${userId}::uuid
      ORDER BY played_on DESC, created_at DESC
      LIMIT ${limit}
    `;
    rows = res.rows as unknown as unknown[];
  } catch (e: unknown) {
    const code = (e as { code?: unknown } | null)?.code;
    if (code === "22P02") return [];
    if (isUndefinedTableError(e)) {
      try {
        await ensurePlaysTable(db);
        const res = await db.sql`
          SELECT
            id,
            user_id,
            machine_id,
            machine_name,
            machine_no,
            store_name,
            played_on,
            total_games,
            big_count,
            reg_count,
            diff_coins,
            invest_yen,
            return_yen,
            memo,
            image_url,
            share_token,
            created_at
          FROM plays
          WHERE user_id = ${userId}::uuid
          ORDER BY played_on DESC, created_at DESC
          LIMIT ${limit}
        `;
        rows = res.rows as unknown as unknown[];
      } catch {
        return [];
      }
    } else {
      throw e;
    }
  }

  type PlayRow = {
    id: string;
    user_id: string;
    machine_id: string;
    machine_name: string;
    machine_no: number | null;
    store_name: string | null;
    played_on: string;
    total_games: number | null;
    big_count: number | null;
    reg_count: number | null;
    diff_coins: number | null;
    invest_yen: number | null;
    return_yen: number | null;
    memo: string | null;
    image_url: string | null;
    share_token: string;
    created_at: string;
  };

  return (rows as unknown as PlayRow[]).map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    machineId: String(r.machine_id),
    machineName: String(r.machine_name),
    machineNo: r.machine_no ?? null,
    storeName: r.store_name ? String(r.store_name) : null,
    playedOn: String(r.played_on),
    totalGames: r.total_games ?? null,
    bigCount: r.big_count ?? null,
    regCount: r.reg_count ?? null,
    diffCoins: r.diff_coins ?? null,
    investYen: r.invest_yen ?? null,
    returnYen: r.return_yen ?? null,
    memo: r.memo ? String(r.memo) : null,
    imageUrl: r.image_url ? String(r.image_url) : null,
    shareToken: String(r.share_token),
    createdAt: String(r.created_at),
  }));
}

export async function deletePlayForUser(userId: string, playId: string): Promise<boolean> {
  const db = getPool();
  if (!db) return false;
  try {
    const { rowCount } = await db.sql`
      DELETE FROM plays
      WHERE id = ${playId}::uuid AND user_id = ${userId}::uuid
    `;
    return (rowCount ?? 0) > 0;
  } catch (e: unknown) {
    if (isUndefinedTableError(e)) {
      try {
        await ensurePlaysTable(db);
        const { rowCount } = await db.sql`
          DELETE FROM plays
          WHERE id = ${playId}::uuid AND user_id = ${userId}::uuid
        `;
        return (rowCount ?? 0) > 0;
      } catch {
        return false;
      }
    }
    throw e;
  }
}

export async function getPlayByShareToken(token: string): Promise<Play | null> {
  const db = getPool();
  if (!db) return null;
  const t = token.trim();
  if (!t) return null;

  let rows: unknown[] = [];
  try {
    const res = await db.sql`
      SELECT
        id,
        user_id,
        machine_id,
        machine_name,
        machine_no,
        store_name,
        played_on,
        total_games,
        big_count,
        reg_count,
        diff_coins,
        invest_yen,
        return_yen,
        memo,
        image_url,
        share_token,
        created_at
      FROM plays
      WHERE share_token = ${t}
      LIMIT 1
    `;
    rows = res.rows as unknown as unknown[];
  } catch (e: unknown) {
    if (isUndefinedTableError(e)) {
      try {
        await ensurePlaysTable(db);
        const res = await db.sql`
          SELECT
            id,
            user_id,
            machine_id,
            machine_name,
            machine_no,
            store_name,
            played_on,
            total_games,
            big_count,
            reg_count,
            diff_coins,
            invest_yen,
            return_yen,
            memo,
            image_url,
            share_token,
            created_at
          FROM plays
          WHERE share_token = ${t}
          LIMIT 1
        `;
        rows = res.rows as unknown as unknown[];
      } catch {
        return null;
      }
    } else {
      throw e;
    }
  }

  type PlayRow = {
    id: string;
    user_id: string;
    machine_id: string;
    machine_name: string;
    machine_no: number | null;
    store_name: string | null;
    played_on: string;
    total_games: number | null;
    big_count: number | null;
    reg_count: number | null;
    diff_coins: number | null;
    invest_yen: number | null;
    return_yen: number | null;
    memo: string | null;
    image_url: string | null;
    share_token: string;
    created_at: string;
  };

  const r = (rows as unknown as PlayRow[])[0];
  if (!r) return null;

  return {
    id: String(r.id),
    userId: String(r.user_id),
    machineId: String(r.machine_id),
    machineName: String(r.machine_name),
    machineNo: r.machine_no ?? null,
    storeName: r.store_name ? String(r.store_name) : null,
    playedOn: String(r.played_on),
    totalGames: r.total_games ?? null,
    bigCount: r.big_count ?? null,
    regCount: r.reg_count ?? null,
    diffCoins: r.diff_coins ?? null,
    investYen: r.invest_yen ?? null,
    returnYen: r.return_yen ?? null,
    memo: r.memo ? String(r.memo) : null,
    imageUrl: r.image_url ? String(r.image_url) : null,
    shareToken: String(r.share_token),
    createdAt: String(r.created_at),
  };
}
