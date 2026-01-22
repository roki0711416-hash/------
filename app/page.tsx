import Link from "next/link";
import LatestXCard from "../components/LatestXCard";
import SubscribeCheckoutButton from "../components/SubscribeCheckoutButton";
import { getCurrentUserFromCookies } from "../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../lib/premium";
import { getRecentPosts } from "../lib/posts";
import { getXConfig } from "../lib/x";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentPosts = await getRecentPosts(2);
  const xConfig = await getXConfig();
  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const sub = user ? await getSubscriptionForUserId(user.id) : null;
  const isPremium = Boolean(user) && (isPremiumPreview || isPremiumForUserAndSubscription(user, sub));

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="space-y-2">
        <h1 className="sr-only">スロカスくん</h1>
      </header>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">パチスロの設定判別をサポートする分析ツール</h2>
        <p className="mt-2 text-sm text-neutral-700">
          スロカスくんは、パチスロの設定判別をサポートする分析ツールです。
          実戦データの入力・整理を通じて、設定傾向を分かりやすく可視化し、情報提供・分析補助を行います。
        </p>

        <p className="mt-3 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">無料</span>
          で使える基本的な設定判別に加え、<span className="font-semibold text-neutral-900">サブスク</span>
          会員向けにはスランプグラフ解析や詳細データを用いた、より踏み込んだ設定判別・分析ツールを提供しています。
        </p>

        <p className="mt-3 text-sm text-neutral-700">
          ジャグラー・ハナハナなどの主要機種に加え、スマスロ・AT機にも対応し、データに基づく判断をサポートします（結果を保証するものではありません）。
        </p>
      </section>

      {/* PCのみ：ヘッダー直下のメイン導線 */}
      <section className="mt-4 hidden lg:block">
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-neutral-100 px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-lg font-semibold text-neutral-900">今日の設定判別はここから</p>
              <p className="mt-1 text-sm text-neutral-700">機種と実測データを入れるだけ</p>
            </div>

            <Link
              href="/judge"
              className="shrink-0 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
            >
              設定判別を始める
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-semibold">主要メニュー</h2>

        <nav aria-label="主要メニュー" className="mt-4">
          {/* Mobile: 1アクション1目的 */}
          <div className="space-y-3 md:hidden">
            <Link
              href="/judge"
              className="flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white"
            >
              <span>設定判別ツールへ</span>
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>

            <Link
              href="/record"
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
            >
              <p className="text-base font-semibold text-neutral-900">収支表</p>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>

            <Link
              href="/machines"
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
            >
              <p className="text-base font-semibold text-neutral-900">機種一覧</p>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>

            <Link
              href="/guide"
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
            >
              <p className="text-base font-semibold text-neutral-900">使い方</p>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>
          </div>

          {/* PC: 一覧性と構造理解 */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-4">
            <Link
              href="/judge"
              className="flex items-center justify-between rounded-2xl bg-neutral-900 px-6 py-6 text-base font-semibold text-white"
            >
              <span>設定判別</span>
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>

            <Link
              href="/record"
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-6"
            >
              <span className="text-base font-semibold text-neutral-900">収支表</span>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>

            <Link
              href="/machines"
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-6"
            >
              <span className="text-base font-semibold text-neutral-900">機種一覧</span>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>

            <Link
              href="/guide"
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-6"
            >
              <span className="text-base font-semibold text-neutral-900">使い方</span>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>

            <Link
              href="/about"
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-6"
            >
              <span className="text-base font-semibold text-neutral-900">運営情報</span>
              <span aria-hidden className="text-xl leading-none text-neutral-800">
                →
              </span>
            </Link>
          </div>
        </nav>
      </section>

      <section className="mt-4 space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">サブスク会員</h2>
          <p className="mt-2 text-sm text-neutral-600">
            月額680円でご利用いただけます。
            <br />
            2日間無料
            <br />
            設定判別・続行判断をすべて体験できます
            <br />
            ※初回のみ。2日間無料終了後は月額680円で自動更新されます
            <br />
            サブスク会員に登録すると、会員限定の機能が使えます。
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>有料会員限定コミュニティ</li>
            <li>判別ツールの会員限定機能</li>
            <li>広告の非表示</li>
          </ul>

          {isPremium ? (
            <Link
              href="/subscriber"
              className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white"
            >
              <span>サブスク会員専用ページへ</span>
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>
          ) : user ? (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-800">登録はこちら</p>
              <p className="mt-1 text-sm text-neutral-700">月額680円</p>
              <p className="mt-1 text-sm text-neutral-700">2日間無料</p>
              <p className="mt-1 text-sm text-neutral-700">設定判別・続行判断をすべて体験できます</p>
              <p className="mt-1 text-xs text-neutral-500">※初回のみ。2日間無料終了後は月額680円で自動更新されます</p>
              <p className="mt-1 text-xs text-neutral-500">クレカ登録のみ・すぐ解約OK</p>
              <SubscribeCheckoutButton showYearly={false} />
              <p className="mt-2 text-xs text-neutral-500">
                ※登録後の管理（解約など）は{" "}
                <Link href="/account" className="underline underline-offset-2">
                  アカウント
                </Link>
                から行えます。
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-800">ログインが必要です</p>
              <p className="mt-1 text-sm text-neutral-700">
                サブスク登録を進めるには、会員登録またはログインしてください。
              </p>
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
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-lg font-semibold">新着情報</h2>
            {recentPosts.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {recentPosts.map((p) => (
                  <li key={p.id}>
                    <div>
                      <span className="text-neutral-500">{p.date}：</span>
                      {p.href ? (
                        <Link
                          href={p.href}
                          className="font-medium text-neutral-900 underline underline-offset-2"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        p.title
                      )}
                    </div>
                    {p.body.trim() !== p.title.trim() ? (
                      <div className="mt-1 whitespace-pre-line text-xs text-neutral-600">
                        {p.body}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">まだ新着情報がありません。</p>
            )}
          </section>

          <LatestXCard profileUrl={xConfig.profileUrl} latestThreadUrl={xConfig.latestThreadUrl} />
        </div>
      </section>
    </main>
  );
}
