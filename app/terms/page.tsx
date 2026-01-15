export const metadata = {
  title: "利用規約 | スロット設定判別ツール",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">利用規約</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div className="space-y-2">
            <p>（スロカスくん）</p>
            <p>
              本利用規約（以下「本規約」といいます。）は、スロカスくん（以下「当サイト」といいます。）が提供する各種サービス（以下「本サービス」といいます。）の利用条件を定めるものです。
              利用者の皆様（以下「ユーザー」といいます。）は、本規約に同意した上で本サービスを利用するものとします。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">第1条（本サービスの内容）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                本サービスは、遊技データ等をもとに、設定推測や判断材料となる情報を提供するツールです。
              </li>
              <li>
                本サービスで提供される情報、数値、推測結果は、あくまで参考情報であり、特定の結果、収支、勝敗、利益等を保証するものではありません。
              </li>
              <li>
                実際の遊技判断および結果については、すべてユーザー自身の責任において行うものとします。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第2条（利用環境）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>本サービスは、PC・スマートフォン等のブラウザ環境で利用できます。</li>
              <li>
                利用環境や通信状況により、本サービスが正常に動作しない場合があります。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第3条（無料サービスと有料サービス）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>本サービスには、無料で利用できる機能と、有料会員向けに提供される機能があります。</li>
              <li>有料サービスの内容、料金、利用条件については、当サイト上に別途表示します。</li>
              <li>
                有料会員向け機能は、当サイトの判断により、内容の変更・追加・削除が行われる場合があります。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第4条（有料会員・サブスクリプション）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                有料会員サービスは、Stripe社が提供する決済システムを利用したサブスクリプション方式により提供されます。
              </li>
              <li>
                有料会員は、所定の料金を支払うことで、定められた期間、本サービスの有料機能を利用することができます。
              </li>
              <li>
                サブスクリプションは、ユーザーが解約手続きを行わない限り、自動的に更新されます。
              </li>
              <li>支払済みの利用料金については、理由の如何を問わず、日割り・返金は行いません。</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第5条（解約）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>有料会員の解約は、所定の方法によりユーザー自身が行うものとします。</li>
              <li>解約手続きが完了した場合でも、既に支払われた利用料金の返金は行いません。</li>
              <li>解約後は、次回更新日以降、有料会員向け機能を利用できなくなります。</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第6条（禁止事項）</h2>
            <p className="mt-2">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの内容、情報、データ等を無断で転載、複製、販売、再配布する行為</li>
              <li>当サイトまたは第三者に不利益、損害を与える行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセス、またはこれを試みる行為</li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第7条（知的財産権）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                本サービスに掲載されている文章、デザイン、プログラム、画像等に関する著作権およびその他の知的財産権は、当サイトまたは正当な権利を有する第三者に帰属します。
              </li>
              <li>
                ユーザーは、当サイトの事前の許可なく、これらを利用することはできません。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第8条（免責事項）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                当サイトは、本サービスの正確性、完全性、有用性、最新性について、いかなる保証も行いません。
              </li>
              <li>
                本サービスの利用により生じたいかなる損害についても、当サイトは一切の責任を負いません。
              </li>
              <li>
                本サービスの内容は、予告なく変更、停止、または終了される場合があります。
              </li>
              <li>
                本サービスから外部サイトへ移動した場合、移動先で提供される情報・サービス等について、当サイトは一切の責任を負いません。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第9条（サービスの変更・停止）</h2>
            <p className="mt-2">
              当サイトは、事前の通知なく、本サービスの全部または一部を変更、停止、終了することができるものとします。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">第10条（規約の変更）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>当サイトは、必要と判断した場合、本規約を変更することができます。</li>
              <li>変更後の規約は、当サイト上に掲載した時点で効力を生じるものとします。</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第11条（準拠法・管轄）</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>本規約の解釈および適用については、日本法を準拠法とします。</li>
              <li>
                本サービスに関して紛争が生じた場合には、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄とします。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold">第12条（お問い合わせ）</h2>
            <p className="mt-2">本規約に関するお問い合わせは、当サイトのお問い合わせページよりご連絡ください。</p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日：2026年1月13日</p>
        </div>
      </section>
    </main>
  );
}
