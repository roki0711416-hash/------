export const metadata = {
  title: "プライバシーポリシー | スロット設定判別ツール",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">プライバシーポリシー</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">取得する情報</h2>
            <p className="mt-2">
              当サイトは、通常の閲覧において氏名・住所・電話番号等の個人情報の入力を求めません。
              ただし、ホスティング事業者によりアクセスログ（IPアドレス等）が自動的に記録される場合があります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">利用目的</h2>
            <p className="mt-2">
              サイト運営・障害対応・不正利用の防止等のために、必要な範囲で情報が利用される場合があります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">外部サービス・Cookie</h2>
            <p className="mt-2">
              当サイトは、ユーザー行動の解析を目的とした外部解析タグの設置を行っていません。
              ただし、ブラウザや配信基盤の仕様により、表示・セキュリティのためにCookie等が利用される場合があります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">お問い合わせ</h2>
            <p className="mt-2">個別のご連絡はお問い合わせページをご利用ください。</p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日: 2026-01-13</p>
        </div>
      </section>
    </main>
  );
}
