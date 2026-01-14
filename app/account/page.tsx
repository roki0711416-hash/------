import Link from "next/link";
import { getSiteUrl } from "../../lib/site";
import { getViewer } from "../../lib/auth";

export const metadata = {
  title: "アカウント | スロット設定判別ツール",
};

function statusLabel(status: string | null): string {
  if (!status) return "未購読";
  if (status === "active") return "購読中";
  if (status === "trialing") return "トライアル中";
  if (status === "past_due") return "支払い確認中";
  if (status === "canceled") return "解約";
  return status;
}

export default async function AccountPage() {
  const viewer = await getViewer();
  const siteUrl = getSiteUrl();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">アカウント</h1>

        {!viewer ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-700">ログインが必要です。</p>
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
            >
              ログイン
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold text-neutral-600">メール</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{viewer.email}</p>
              <p className="mt-2 text-xs text-neutral-600">
                ステータス：{statusLabel(viewer.subscriptionStatus)}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                端末：{viewer.deviceMatch ? "この端末で有効" : viewer.deviceBound ? "別端末で使用中" : "未登録"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-sm font-semibold">サブスク</p>
              <p className="mt-1 text-xs text-neutral-600">月額（税込）680円</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action="/api/stripe/checkout" method="post">
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    購読を開始
                  </button>
                </form>

                <form action="/api/stripe/portal" method="post">
                  <button
                    type="submit"
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold"
                  >
                    お支払い管理
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-sm font-semibold">端末解除（救済）</p>
              <p className="mt-1 text-xs text-neutral-600">
                端末変更などでログインできない場合、端末解除リンクをメールで送れます（24時間で3回まで）。
              </p>

              <form action="/api/device/reset/request" method="post" className="mt-3">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold"
                >
                  端末解除メールを送る
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between">
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-neutral-700 underline underline-offset-2"
                >
                  ログアウト
                </button>
              </form>
              <div className="flex items-center gap-4">
                <a
                  href={`${siteUrl}/tool`}
                  className="text-sm text-neutral-700 underline underline-offset-2"
                >
                  ツールへ
                </a>
                <Link
                  href="/log"
                  className="text-sm text-neutral-700 underline underline-offset-2"
                >
                  収支へ
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="mt-6">
        <Link href="/" className="text-sm text-neutral-700 underline underline-offset-2">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
