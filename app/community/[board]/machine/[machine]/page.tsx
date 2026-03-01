import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserFromCookies } from "../../../../../lib/auth";
import { getDb } from "../../../../../lib/db";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../../../../lib/premium";
import { boardLabel, isBoardId, needsMachine, type BoardId } from "../../../../../lib/community";
import CommunityThreadForm from "../../../../../components/CommunityThreadForm";

export const dynamic = "force-dynamic";

function fmt(dt: unknown) {
  const d = new Date(String(dt));
  if (!Number.isFinite(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default async function CommunityMachinePage({
  params,
}: {
  params: Promise<{ board: string; machine: string }>;
}) {
  const { board, machine } = await params;
  if (!isBoardId(board)) notFound();
  const boardId = board as BoardId;
  if (!needsMachine(boardId)) notFound();

  const machineName = decodeURIComponent(machine).trim();
  if (!machineName || machineName.length > 50) notFound();

  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← 条件選択
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">ログインが必要です</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const sub = await getSubscriptionForUserId(user.id);
  const isPremium = isPremiumPreview || isPremiumForUserAndSubscription(user, sub);

  if (!isPremium) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← 条件選択
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">有料会員限定です</p>
            <p className="mt-1 text-sm text-muted">アカウント画面から登録してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                アカウントへ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const db = getDb();
  if (!db) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← 条件選択
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">DBが未設定です</p>
            <p className="mt-1 text-sm text-muted">DATABASE_URL または POSTGRES_URL を設定してください。</p>
          </div>
        </section>
      </main>
    );
  }

  // username必須
  const { rows: userRows } = await db.sql`SELECT username FROM users WHERE id = ${user.id} LIMIT 1`;
  const userRow = userRows[0] as { username: string | null } | undefined;
  const username = (userRow?.username ?? "").trim() || null;

  if (!username) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
            >
              ← 条件選択
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-white">ユーザーネーム設定が必要です</p>
            <p className="mt-1 text-sm text-muted">/account からユーザーネームを設定してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
              >
                アカウントへ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  let threads: unknown[] = [];
  try {
    const result = await db.sql`
      SELECT id, title, prefecture, hall, machine, reply_count, username, updated_at
      FROM community_threads
      WHERE board_id = ${boardId} AND machine = ${machineName}
      ORDER BY updated_at DESC, id DESC
      LIMIT 100
    `;
    threads = result.rows;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes('relation "community_threads" does not exist')) {
      return (
        <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
              <Link
                href={`/community/${boardId}`}
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
              >
                ← 条件選択
              </Link>
            </div>
            <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-white">掲示板DBが未初期化です</p>
              <p className="mt-1 text-sm text-muted">ターミナルで `npm run db:init-community` を実行してください。</p>
            </div>
          </section>
        </main>
      );
    }
    throw e;
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <p className="mt-1 text-sm font-semibold text-muted">{machineName}</p>
          </div>
          <Link
            href={`/community/${boardId}`}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
          >
            ← 条件選択
          </Link>
        </div>

        <div id="new-thread" className="scroll-mt-24">
          <CommunityThreadForm boardId={boardId} username={username} preset={{ machine: machineName }} />
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-white">スレ一覧</h2>

          {threads.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {threads.map((t) => {
                const th = t as {
                  id: string;
                  title: string;
                  prefecture: string | null;
                  hall: string | null;
                  machine: string | null;
                  reply_count: number;
                  username: string;
                  updated_at: string;
                };

                const extra = [th.prefecture, th.hall, th.machine].filter(Boolean).join(" / ");

                return (
                  <li key={th.id}>
                    <Link
                      href={`/community/${boardId}/${th.id}`}
                      className="block rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{th.title}</p>
                        <p className="text-xs text-white/40">
                          {th.reply_count}レス・最終 {fmt(th.updated_at)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-white/40">
                        {th.username}
                        {extra ? `・${extra}` : ""}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">まだスレがありません。</p>
          )}
        </div>
      </section>
    </main>
  );
}
