import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { computeSignal } from "@/lib/analytics/storeScore";
import { mockAdapter } from "@/lib/sources/mockAdapter";
import { getDb } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

// POST /api/admin/stores/batch — バッチ実行（管理者のみ）
export async function POST() {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "DB未設定" }, { status: 503 });
  }

  const adapter = mockAdapter;
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 3);
  const dateRange = { from: formatDate(from), to: formatDate(today) };

  const { rows: stores } = await db.sql`SELECT id, name, prefecture FROM stores ORDER BY name`;
  let totalSignals = 0;

  for (const store of stores as { id: string; name: string; prefecture: string }[]) {
    const observations = await adapter.fetchObservations(store, dateRange);
    for (const dated of observations) {
      const signal = computeSignal(dated.observation);
      const sourceHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(dated.observation))
        .digest("hex")
        .slice(0, 16);

      await db.sql`
        INSERT INTO store_daily_signals
          (id, store_id, date, traffic_index, swing_index, reward_index, high_chance_index, note, source_hash)
        VALUES (
          ${generateId("sig")},
          ${store.id},
          ${dated.date},
          ${signal.trafficIndex},
          ${signal.swingIndex},
          ${signal.rewardIndex},
          ${signal.highChanceIndex},
          ${signal.note},
          ${sourceHash}
        )
        ON CONFLICT (store_id, date) DO UPDATE SET
          traffic_index     = EXCLUDED.traffic_index,
          swing_index       = EXCLUDED.swing_index,
          reward_index      = EXCLUDED.reward_index,
          high_chance_index = EXCLUDED.high_chance_index,
          note              = EXCLUDED.note,
          source_hash       = EXCLUDED.source_hash,
          updated_at        = now()
      `;
      totalSignals++;
    }
  }

  return NextResponse.json({
    ok: true,
    stores: stores.length,
    signals: totalSignals,
    dateRange,
  });
}
