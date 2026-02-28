import type { Metadata } from "next";
import PrefecturesGateway from "@/components/PrefecturesGateway";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

export const metadata: Metadata = {
  title: "全国の入口｜地方・都道府県から探す｜スロカスくん",
  description: "地域カテゴリと都道府県検索から都道府県ページへ移動できる全国入口ページです。",
  alternates: { canonical: `${BASE_URL}/prefectures` },
};

export default function PrefecturesIndexPage() {
  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6">
        <PrefecturesGateway />
        <p className="mt-8 text-[10px] leading-relaxed text-white/20">
          ※ 本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
