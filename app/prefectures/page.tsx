import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "都道府県一覧 | 店舗傾向 | スロカスくん",
  description: "パチスロ店舗の独自傾向分析を都道府県から探す（参考情報）",
  robots: "noindex",
};

const REGIONS: { name: string; prefs: string[] }[] = [
  { name: "北海道・東北", prefs: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefs: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { name: "中部", prefs: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { name: "近畿", prefs: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国・四国", prefs: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefs: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

export default function PrefecturesIndexPage() {
  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <h1 className="text-xl font-bold">都道府県から店舗を探す</h1>
        <p className="mt-2 text-xs text-neutral-500">
          ※ 公開情報等を基にした独自集計の参考情報です。結果を保証するものではありません。
        </p>

        <div className="mt-6 space-y-6">
          {REGIONS.map((region) => (
            <section key={region.name}>
              <h2 className="text-sm font-semibold text-neutral-500">{region.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {region.prefs.map((pref) => (
                  <Link
                    key={pref}
                    href={`/prefectures/${encodeURIComponent(pref)}`}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
                  >
                    {pref}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
