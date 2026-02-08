import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | スロカスくん（スロット設定判別ツール）",
  description:
    "スロカスくんのプライバシーポリシーです。取得する情報・利用目的・Cookie・広告配信・データ保護について説明しています。",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-neutral-500">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <span>プライバシーポリシー</span>
      </nav>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">プライバシーポリシー</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <p>
            本プライバシーポリシーは、スロカスくん（以下「当サイト」）が取得する情報、
            その利用目的、および管理方法について定めるものです。
          </p>

          <div>
            <h2 className="font-semibold">第1条（取得する情報）</h2>
            <p className="mt-2">
              当サイトは、通常の閲覧において氏名・住所・電話番号等の個人情報の入力を求めません。
              ただし、以下の情報が自動的に取得される場合があります。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>ホスティング事業者によるアクセスログ（IPアドレス、アクセス日時、ブラウザ情報等）</li>
              <li>会員登録時に入力されたメールアドレスおよびユーザーネーム</li>
              <li>Cookieによるセッション情報</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold">第2条（利用目的）</h2>
            <p className="mt-2">
              取得した情報は、以下の目的の範囲内で利用します。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>サイト運営・障害対応・不正利用の防止</li>
              <li>会員の認証・サービス提供</li>
              <li>サービス改善のための分析（個人を特定しない形で）</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold">第3条（Cookie の利用）</h2>
            <div className="mt-2 space-y-2">
              <p>
                当サイトでは、ログイン状態の維持やセッション管理のために Cookie を利用しています。
              </p>
              <p>
                また、第三者配信の広告サービス（Google AdSense）および関連サービスにおいても、
                広告配信・表示最適化の目的で Cookie が使用される場合があります。
              </p>
              <p>
                Cookie の利用は、お使いのブラウザの設定で無効化できます。
                ただし、無効化により一部機能が正しく動作しない場合があります。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">第4条（広告配信 ─ Google AdSense）</h2>
            <div className="mt-2 space-y-2">
              <p>
                当サイトでは、Google LLC が提供する第三者配信の広告サービス「Google AdSense」を利用しています。
              </p>
              <p>
                Google を含む第三者配信事業者は、Cookie を使用してユーザーの当サイトや他サイトへの
                アクセス情報に基づき、パーソナライズ広告を表示することがあります。
              </p>
              <p>
                Google によるパーソナライズ広告は、{" "}
                <a
                  className="underline"
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google 広告設定
                </a>
                {" "}から無効化できます。また、{" "}
                <a
                  className="underline"
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noreferrer"
                >
                  aboutads.info
                </a>
                {" "}で第三者配信事業者による Cookie の利用を管理できます。
              </p>
              <p>
                詳細は{" "}
                <a
                  className="underline"
                  href="https://policies.google.com/technologies/ads?hl=ja"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google の広告に関するポリシー
                </a>
                {" "}をご確認ください。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">第5条（モバイルアプリにおける広告）</h2>
            <p className="mt-2">
              当サイトのモバイルアプリ版では、Google AdMob 等の第三者配信の広告サービスを利用する場合があります。
              広告配信事業者は、広告表示の最適化のためにデバイスの広告識別子（Advertising ID）等を利用することがあります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">第6条（情報の管理）</h2>
            <p className="mt-2">
              当サイトは、取得した情報について、不正アクセスや情報漏洩の防止に努めます。
              ただし、インターネットの性質上、セキュリティを完全に保証することはできません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">第7条（ポリシーの変更）</h2>
            <p className="mt-2">
              本ポリシーは、必要に応じて変更されることがあります。
              変更後のポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">第8条（お問い合わせ）</h2>
            <p className="mt-2">
              本ポリシーに関するご質問は、{" "}
              <Link href="/contact" className="underline underline-offset-2">
                お問い合わせページ
              </Link>
              {" "}よりご連絡ください。
            </p>
          </div>

          <p className="text-xs text-neutral-500">制定日: 2026-01-13 ／ 最終更新日: 2026-02-08</p>
        </div>
      </section>
    </main>
  );
}
