export const metadata = {
  title: "免責事項 | スロット設定判別ツール",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">免責事項</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">情報の正確性</h2>
            <p className="mt-2">
              当サイトに掲載する情報は、可能な範囲で正確性・最新性の確保に努めていますが、その内容を保証するものではありません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">利用結果</h2>
            <p className="mt-2">
              当サイトの利用により生じたいかなる損害についても、当サイトは一切の責任を負いません。
              実際の遊技判断はご自身の責任で行ってください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">外部リンク</h2>
            <p className="mt-2">
              当サイトから外部サイトへ移動した場合、移動先で提供される情報・サービス等について当サイトは責任を負いません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">内容の変更</h2>
            <p className="mt-2">
              当サイトは、予告なく掲載内容の変更・停止を行う場合があります。
            </p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日: 2026-01-13</p>
        </div>
      </section>
    </main>
  );
}
