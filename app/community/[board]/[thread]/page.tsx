import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserFromCookies } from "../../../../lib/auth";
import { getDb } from "../../../../lib/db";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../../../lib/premium";
import {
  boardLabel,
  isBoardId,
  needsHall,
  needsMachine,
  needsPrefecture,
  type BoardId,
} from "../../../../lib/community";
import CommunityReplyForm from "../../../../components/CommunityReplyForm";

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

export default async function CommunityThreadPage({
  params,
}: {
  params: Promise<{ board: string; thread: string }>;
}) {
  const { board, thread } = await params;
  if (!isBoardId(board)) notFound();
  const boardId = board as BoardId;
  const threadId = thread;

  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← スレ一覧
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ログインが必要です</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
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
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← スレ一覧
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">有料会員限定です</p>
            <p className="mt-1 text-sm text-neutral-700">アカウント画面から登録してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
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
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← スレ一覧
            </Link>
          </div>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">DBが未設定です</p>
            <p className="mt-1 text-sm text-neutral-700">DATABASE_URL または POSTGRES_URL を設定してください。</p>
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
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
            <Link
              href={`/community/${boardId}`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
            >
              ← スレ一覧
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">ユーザーネーム設定が必要です</p>
            <p className="mt-1 text-sm text-neutral-700">/account からユーザーネームを設定してください。</p>
            <div className="mt-3">
              <Link
                href="/account"
                className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                アカウントへ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // thread
  const { rows: tRows } = await db.sql`
    SELECT id, board_id, prefecture, hall, machine, title, reply_count, username, created_at, updated_at
    FROM community_threads
    WHERE id = ${threadId}
    LIMIT 1
  `;
  const threadRow = tRows[0] as
    | {
        id: string;
        board_id: string;
        prefecture: string | null;
        hall: string | null;
        machine: string | null;
        title: string;
        reply_count: number;
        username: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!threadRow || threadRow.board_id !== boardId) notFound();

  const extra = [threadRow.prefecture, threadRow.hall, threadRow.machine].filter(Boolean).join(" / ");

  const backHref = (() => {
    if (needsPrefecture(boardId) && threadRow.prefecture) {
      return `/community/${boardId}/pref/${encodeURIComponent(threadRow.prefecture)}`;
    }
    if (needsHall(boardId) && threadRow.hall) {
      return `/community/${boardId}/hall/${encodeURIComponent(threadRow.hall)}`;
    }
    if (needsMachine(boardId) && threadRow.machine) {
      return `/community/${boardId}/machine/${encodeURIComponent(threadRow.machine)}`;
    }
    return `/community/${boardId}`;
  })();

  const { rows: posts } = await db.sql`
    SELECT post_no, username, body, created_at
    FROM community_thread_posts
    WHERE thread_id = ${threadId}
    ORDER BY post_no ASC
    LIMIT 500
  `;

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{boardLabel(boardId)}</h1>
          <Link
            href={backHref}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
          >
            ← スレ一覧
          </Link>
        </div>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-900">{threadRow.title}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {threadRow.username}・{fmt(threadRow.created_at)}
            {extra ? `・${extra}` : ""}
          </p>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-semibold text-neutral-800">レス</h2>

          {posts.length > 0 ? (
            <ol className="mt-3 space-y-3">
              {posts.map((p) => {
                const r = p as { post_no: number; username: string; body: string; created_at: string };
                return (
                  <li key={r.post_no} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs text-neutral-500">
                      {r.post_no}：{r.username}・{fmt(r.created_at)}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm text-neutral-800">{r.body}</p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">まだレスがありません。</p>
          )}
        </div>

        <CommunityReplyForm threadId={threadId} username={username} />
      </section>
    </main>
  );
}
