import Link from "next/link";
import type { Metadata } from "next";
import { listStoresByPrefecture, getLatestSignalForStores } from "@/lib/storeAnalytics";

export const dynamic = "force-dynamic";

// 主要都道府県一覧
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

type Params = { params: Promise<{ pref: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { pref } = await params;
  const prefName = decodeURIComponent(pref);
  return {
    title: `${prefName}の店舗傾向 | スロカスくん`,
    description: `${prefName}のパチスロ店舗ごとの独自傾向分析（参考情報）`,
    robots: "noindex",
  };
}

function indexLabel(value: number): string {
  if (value >= 70) return "高め";
  if (value >= 40) return "普通";
  return "低め";
}

function indexColor(value: number): string {
  if (value >= 70) return "text-green-700";
  if (value >= 40) return "text-neutral-700";
  return "text-neutral-400";
}

export default async function PrefecturePage({ params }: Params) {
  const { pref } = await params;
  const prefName = decodeURIComponent(pref);

  const stores = await listStoresByPrefecture(prefName);
  const storeIds = stores.map((s) => s.id);
  const latestSignals = await getLatestSignalForStores(storeIds);

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <h1 className="text-xl font-bold">{prefName}の店舗傾向</h1>
        <p className="mt-2 text-xs text-neutral-500">
          ※ 公開情報等を基にした独自集計の参考情報です。結果を保証するものではありません。
        </p>

        {stores.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-600">
            {prefName}に登録されている店舗はまだありません。
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {stores.map((store) => {
              const signal = latestSignals.get(store.id);
              return (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:bg-neutral-50"
                >
                  <p className="text-base font-semibold">{store.name}</p>
                  {store.city && (
                    <p className="mt-0.5 text-xs text-neutral-500">{store.city}</p>
                  )}
                  {signal ? (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className={indexColor(signal.traffic_index)}>
                        活性 {signal.traffic_index}
                      </span>
                      <span className={indexColor(signal.reward_index)}>
                        還元 {signal.reward_index}
                      </span>
                      <span className={indexColor(signal.swing_index)}>
                        荒さ {signal.swing_index}
                      </span>
                      <span className={indexColor(signal.high_chance_index)}>
                        期待 {signal.high_chance_index}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-400">データなし</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/prefectures" className="text-sm text-neutral-600 underline underline-offset-2">
            ← 都道府県一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
