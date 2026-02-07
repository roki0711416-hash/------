import Link from "next/link";
import LatestXCard from "../components/LatestXCard";
import SubscribeCheckoutButton from "../components/SubscribeCheckoutButton";
import { getCurrentUserFromCookies } from "../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../lib/premium";
import { getXConfig } from "../lib/x";

export const dynamic = "force-dynamic";

export default async function Home() {
  // X（旧Twitter）アカウント凍結等の事情で一時的に非表示にするためのフラグ
  const isXSectionEnabled = false;
  const xConfig = isXSectionEnabled ? await getXConfig() : null;
  const user = await getCurrentUserFromCookies();
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const sub = user ? await getSubscriptionForUserId(user.id) : null;
  const isPremium = Boolean(user) && (isPremiumPreview || isPremiumForUserAndSubscription(user, sub));

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <h1 className="sr-only">スロカスくん</h1>

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

          {isXSectionEnabled && xConfig ? (
            <LatestXCard profileUrl={xConfig.profileUrl} latestThreadUrl={xConfig.latestThreadUrl} />
          ) : null}
        </section>
      </div>

      <section aria-labelledby="seo-home">
        <div className="max-w-3xl mx-auto px-4 my-16 space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 id="seo-home" className="text-lg font-semibold">
              スロカスくんでできること（設定判別・続行判断の考え方）
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
              <div>
                <h3 className="font-semibold text-neutral-900">スロカスくんとは</h3>
                <p className="mt-1">
                  スロカスくんは、パチスロの設定判別や続行判断を、感覚や勢いだけで決めずに「根拠を整理して考える」ためのWebツールです。
                  その日の実戦で集めた情報を入力・整理し、判断材料を見える形にまとめます（遊技結果や勝率を保証するものではありません）。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">できること</h3>
                <p className="mt-1">
                  設定判別ツールで要素を入力して推測の根拠を並べたり、機種情報を参照したり、収支表で実戦を振り返ったりできます。
                  「入力→振り返り→次の改善」を同じ場所で回せるので、メモが散らばりやすい人でも継続しやすい設計です。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">無料と有料（サブスク）の違い</h3>
                <p className="mt-1">
                  無料でも基本的な設定判別や記録機能を利用できます。
                  さらに深く検討したい方向けに、サブスク会員では会員限定の判別機能やスランプグラフ解析など、踏み込んだ判断材料を提供します。
                  併せて広告の非表示や会員限定コミュニティなど、集中しやすい環境も利用できます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">おすすめ対象</h3>
                <p className="mt-1">
                  根拠を言語化して立ち回りたい人、打った後に復習して精度を上げたい人、感覚のブレを減らして判断を安定させたい人におすすめです。
                  逆に、結論だけを最短で知りたい人よりも、入力して考える手間を許容できる人ほど効果を感じやすいです。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">他サイトとの違い</h3>
                <p className="mt-1">
                  攻略情報を読むだけでは「自分の台の状況」に落とし込みにくいことがあります。
                  スロカスくんは、一般的な知識を前提にしつつ、あなたの実戦データを入力して整理することで、判断のプロセス自体を支援します。
                  そのため、読み物よりも“実戦の思考補助”として使える点が特徴です。
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
