import Link from "next/link";
import AccountActions from "../../components/AccountActions";
import UsernameForm from "../../components/UsernameForm";
import { getCurrentUserFromCookies } from "../../lib/auth";
import { getDb } from "../../lib/db";
import {
  getSubscriptionForUserId,
  isPremiumStatus,
  type SubscriptionRow,
} from "../../lib/premium";

import CheckoutSync from "./sync/CheckoutSync";

function fmtDate(d: string | null) {
  if (!d) return null;
  const date = new Date(d);
  if (!Number.isFinite(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const checkout = typeof sp.checkout === "string" ? sp.checkout : undefined;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;

  const user = await getCurrentUserFromCookies();

  let username: string | null = null;
  if (user) {
    const db = getDb();
    if (db) {
      const { rows } = await db.sql`SELECT username FROM users WHERE id = ${user.id} LIMIT 1`;
      const row = rows[0] as { username: string | null } | undefined;
      username = row?.username ?? null;
    }
  }

  let sub: SubscriptionRow | null = null;
  if (user) sub = await getSubscriptionForUserId(user.id);

  const isPremium = isPremiumStatus(sub?.status ?? null);
  const hasYearly = Boolean(process.env.STRIPE_PRICE_ID_YEARLY?.trim());

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">アカウント</h1>
          <Link
            href="/"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
          >
            ← トップ
          </Link>
        </div>

        {checkout === "success" ? (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">購入処理を受け付けました</p>
            <p className="mt-1 text-sm text-neutral-700">
              反映はWebhook経由なので、数秒〜数十秒かかることがあります。
            </p>
            {sessionId ? <CheckoutSync sessionId={sessionId} /> : null}
          </div>
        ) : null}

        {checkout === "cancel" ? (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-800">購入をキャンセルしました</p>
          </div>
        ) : null}

        {!user ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-700">ログインしていません。</p>
            <div className="flex gap-2">
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
        ) : (
          <>
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-800">ログイン中</p>
              <p className="mt-1 text-sm text-neutral-700">{user.email}</p>
            </div>

            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-800">ユーザーネーム</p>
              <p className="mt-1 text-sm text-neutral-700">
                {username ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{username}</span>
                    {isPremium ? (
                      <span
                        aria-label="有料会員"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-bold text-neutral-900"
                      >
                        7
                      </span>
                    ) : null}
                  </span>
                ) : (
                  "未設定"
                )}
              </p>

              {!username ? (
                <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    口コミ投稿にはユーザーネーム設定が必要です
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    いまは未設定のため、口コミを投稿できません。下のフォームから設定してください。
                  </p>
                </div>
              ) : null}

              <UsernameForm initialUsername={username} />
              <p className="mt-2 text-xs text-neutral-500">
                ※空白なし・20文字以内。後から変更できます。
              </p>
            </div>

            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-800">会員状態</p>
              <p className="mt-1 text-sm text-neutral-700">
                {isPremium ? "有料会員" : "無料会員"}
              </p>
              {sub?.trial_end ? (
                <p className="mt-1 text-xs text-neutral-600">
                  トライアル終了予定：{fmtDate(sub.trial_end)}
                </p>
              ) : null}
              {sub?.current_period_end ? (
                <p className="mt-1 text-xs text-neutral-600">
                  期限：{fmtDate(sub.current_period_end)}
                </p>
              ) : null}

              <div className="mt-3">
                {isPremium ? (
                  <Link
                    href="/community"
                    className="inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
                  >
                    有料会員限定コミュニティへ
                  </Link>
                ) : (
                  <p className="text-xs text-neutral-600">
                    ※有料会員になると「有料会員限定コミュニティ」が利用できます。（有料会員様限定コミュニティと機能）
                  </p>
                )}
              </div>
            </div>

            <AccountActions
              canManage={Boolean(user.stripeCustomerId)}
              isPremium={isPremium}
              showYearly={hasYearly}
            />

            <p className="mt-4 text-xs text-neutral-500">
              ※端末共有NG: ログインは常に最後の1台のみ有効です。
            </p>
          </>
        )}
      </section>
    </main>
  );
}
