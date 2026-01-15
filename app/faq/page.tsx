export const metadata = {
  title: "よくある質問（FAQ） | スロット設定判別ツール",
};

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">よくある質問（FAQ）</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">Q1. このツールを使えば必ず勝てますか？</h2>
            <div className="mt-2 space-y-2">
              <p>いいえ、必ず勝てることを保証するものではありません。</p>
              <p>
                本サービスは、入力されたデータをもとに設定推測や判断材料を整理・可視化するツールです。
                実際の設定・結果・収支を保証するものではなく、最終的な遊技判断はご自身の責任で行ってください。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q2. 無料会員と有料会員の違いは何ですか？</h2>
            <div className="mt-2 space-y-2">
              <p>無料会員では、基本的な機能をお試しいただけます。</p>
              <p>有料会員では、以下のような追加機能をご利用いただけます。</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>より詳細な設定推測表示</li>
                <li>有料会員限定の分析・判別機能</li>
                <li>その他、今後追加される有料会員向け機能</li>
              </ul>
              <p>※具体的な内容は、各プランの案内ページをご確認ください。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q3. 有料会員の料金はいくらですか？</h2>
            <div className="mt-2 space-y-2">
              <p>有料会員の料金は、当サイト内のプラン案内ページに記載しています。</p>
              <p>表示価格はすべて税込価格です。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q4. 支払い方法は何がありますか？</h2>
            <div className="mt-2 space-y-2">
              <p>クレジットカード決済のみ対応しています。</p>
              <p>決済には Stripe社の決済システム を利用しています。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q5. サブスクリプションは自動更新ですか？</h2>
            <div className="mt-2 space-y-2">
              <p>はい。</p>
              <p>
                有料会員サービスはサブスクリプション方式となっており、解約手続きを行わない限り自動更新されます。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q6. 解約方法を教えてください</h2>
            <div className="mt-2 space-y-2">
              <p>有料会員の解約は、マイページ（アカウント画面）からいつでも行えます。</p>
              <p>
                解約後も、次回更新日までは有料会員向け機能をご利用いただけます。
                次回更新日を過ぎると、自動的に無料会員に戻ります。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q7. 途中解約した場合、返金はありますか？</h2>
            <div className="mt-2 space-y-2">
              <p>いいえ。</p>
              <p>
                本サービスはデジタルコンテンツおよびサブスクリプションサービスの性質上、
                途中解約・日割り計算・返金には対応しておりません。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q8. スマートフォンでも利用できますか？</h2>
            <div className="mt-2 space-y-2">
              <p>はい。</p>
              <p>
                スマートフォン・タブレット・PCなど、ブラウザが利用できる環境でご利用いただけます。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q9. 入力したデータは保存されますか？</h2>
            <div className="mt-2 space-y-2">
              <p>入力内容の保存仕様については、サービス内容により異なります。</p>
              <p>個人情報（氏名・住所・電話番号等）の入力は求めていません。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q10. 未成年でも利用できますか？</h2>
            <div className="mt-2 space-y-2">
              <p>本サービスは、未成年者の利用を推奨するものではありません。</p>
              <p>各地域のルール・法令を遵守した上でご利用ください。</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q11. サービス内容は今後変わりますか？</h2>
            <div className="mt-2 space-y-2">
              <p>はい。</p>
              <p>
                本サービスは、予告なく機能の追加・変更・停止を行う場合があります。
                あらかじめご了承ください。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q12. 不具合や要望がある場合はどうすればいいですか？</h2>
            <div className="mt-2 space-y-2">
              <p>不具合の報告やご要望は、お問い合わせページよりご連絡ください。</p>
              <p>
                すべてに個別対応できない場合もありますが、運営改善の参考にさせていただきます。
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Q13. 広告は表示されますか？</h2>
            <div className="mt-2 space-y-2">
              <p>
                当サイトでは、第三者配信の広告サービス（例：Google AdSense）を利用する場合があります。
              </p>
              <p>広告の表示内容は、ユーザーの興味関心に基づく場合があります。</p>
            </div>
          </div>

          <p className="text-xs text-neutral-500">最終更新日：2026年1月13日</p>
        </div>
      </section>
    </main>
  );
}
