export const metadata = {
  title: "特定商取引法に基づく表記 | スロット設定判別ツール",
};

export default function TokushoPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">特定商取引法に基づく表記</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">販売事業者</h2>
            <p className="mt-2">個人運営</p>
          </div>

          <div>
            <h2 className="font-semibold">運営責任者</h2>
            <p className="mt-2">スロカスくん運営事務局</p>
          </div>

          <div>
            <h2 className="font-semibold">サイト名</h2>
            <p className="mt-2">スロカスくん（スロット設定判別ツール）</p>
          </div>

          <div>
            <h2 className="font-semibold">サイトURL</h2>
            <p className="mt-2">
              <a
                className="underline"
                href="https://slokasukun.com"
                target="_blank"
                rel="noreferrer"
              >
                https://slokasukun.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold">所在地</h2>
            <p className="mt-2">請求があった場合、遅滞なく開示いたします。</p>
          </div>

          <div>
            <h2 className="font-semibold">連絡先</h2>
            <div className="mt-2 space-y-2">
              <p>
                お問い合わせは、下記のお問い合わせページよりお願いいたします。
              </p>
              <p>
                <a
                  className="underline"
                  href="https://slokasukun.com/contact"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://slokasukun.com/contact
                </a>
              </p>
              <p>※電話番号についても、請求があった場合に遅滞なく開示いたします。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">販売価格</h2>
            <div className="mt-2 space-y-2">
              <p>
                各サービス・有料プランの料金は、当サイト内の該当ページに記載しております。
              </p>
              <p>（表示価格はすべて税込価格です）</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">商品代金以外の必要料金</h2>
            <p className="mt-2">
              インターネット接続にかかる通信費用は、ユーザーご自身の負担となります。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">支払方法</h2>
            <div className="mt-2 space-y-2">
              <p>クレジットカード決済</p>
              <p>（Stripe社の決済システムを利用）</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">支払時期</h2>
            <p className="mt-2">
              有料会員登録時に決済が行われ、その後は契約内容に応じて自動的に更新されます。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">サービス提供時期</h2>
            <p className="mt-2">
              決済完了後、直ちに有料会員向けサービスをご利用いただけます。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">返品・キャンセル・返金について</h2>
            <p className="mt-2">
              本サービスはデジタルコンテンツおよびサブスクリプションサービスの性質上、
              お申し込み後のキャンセル、返金、日割り計算による返金には応じておりません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">解約について</h2>
            <div className="mt-2 space-y-2">
              <p>
                有料会員の解約は、ユーザーご自身で所定の方法により行うものとします。
              </p>
              <p>
                解約手続きが完了した場合でも、既に支払われた利用料金の返金は行われません。
              </p>
              <p>
                解約後は、次回更新日以降、有料会員向けサービスをご利用いただけなくなります。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">表現およびサービスに関する注意書き</h2>
            <p className="mt-2">
              本サービスで提供される情報、数値、推測結果等は、あくまで参考情報であり、
              特定の結果、収支、勝敗、利益等を保証するものではありません。
              実際の遊技判断および結果については、すべてユーザー自身の責任において行ってください。
            </p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日：2026年1月13日</p>
        </div>
      </section>
    </main>
  );
}
