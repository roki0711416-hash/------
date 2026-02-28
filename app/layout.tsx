import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import HeaderMachineSearchBox from "../components/HeaderMachineSearchBox";
import GmoSiteSeal from "../components/GmoSiteSeal";
import GradientBg from "../components/ui/GradientBg";

export const metadata: Metadata = {
  title: "スロカスくん | スロット設定判別ツール",
  description: "スロカスくん（スロット設定判別ツール）：スロットの設定判別を補助するWebツール",
  verification: {
    google: "QqbnEFPRBiH4haH8",
  },
  other: {
    "google-adsense-account": "ca-pub-6861979311690077",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6861979311690077"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen text-txt">
        {/* 全ページ共通：アンビエントグローオーブ背景 */}
        <GradientBg />

        <header className="relative z-20 w-full border-b border-white/[0.08] bg-bg0/80 backdrop-blur-xl">
          {/* SP/タブレット（〜1023px）：2段ヘッダー */}
          <div className="lg:hidden">
            <div className="mx-auto w-full max-w-xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  aria-label="トップへ"
                  className="flex shrink-0 items-center gap-2"
                >
                  <Image
                    src="/icon.png"
                    alt="スロカスくん"
                    width={32}
                    height={32}
                    priority
                  />
                  <span className="text-base font-semibold text-white">スロカスくん</span>
                </Link>
              </div>

              <div className="mt-3">
                <HeaderMachineSearchBox />
              </div>

              {/* クイックナビ */}
              <nav aria-label="クイックナビ" className="mt-3 -mx-4 px-4 overflow-x-auto scrollbar-none">
                <ul className="flex items-center gap-2 text-xs font-medium whitespace-nowrap pb-1">
                  <li>
                    <Link href="/judge" className="inline-block rounded-full bg-gradient-to-r from-cta-from to-cta-to px-3 py-1.5 text-white">
                      設定判別
                    </Link>
                  </li>
                  <li>
                    <Link href="/machines" className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
                      機種一覧
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
                      コミュニティ
                    </Link>
                  </li>
                  <li>
                    <Link href="/record" className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
                      収支表
                    </Link>
                  </li>
                  <li>
                    <Link href="/guide" className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80">
                      使い方
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* PC(min-width:1024px): 新ヘッダー */}
          <div className="hidden lg:block">
            <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4">
              <Link href="/" aria-label="トップへ" className="flex shrink-0 items-center gap-2">
                <Image
                  src="/icon.png"
                  alt="スロカスくん"
                  width={36}
                  height={36}
                  priority
                />
                <span className="text-base font-semibold text-white">スロカスくん</span>
              </Link>

              <div className="flex-1">
                <HeaderMachineSearchBox />
              </div>

              <nav aria-label="ヘッダー" className="shrink-0">
                <ul className="flex items-center justify-end gap-5 text-sm font-medium">
                  <li>
                    <Link href="/lp" className="text-white/70 transition hover:text-white">
                      はじめに
                    </Link>
                  </li>
                  <li>
                    <Link href="/judge" className="text-white/70 transition hover:text-white">
                      設定判別
                    </Link>
                  </li>
                  <li>
                    <Link href="/machines" className="text-white/70 transition hover:text-white">
                      機種一覧
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="text-white/70 transition hover:text-white">
                      コミュニティ
                    </Link>
                  </li>
                  <li>
                    <Link href="/record" className="text-white/70 transition hover:text-white">
                      収支表
                    </Link>
                  </li>
                  <li>
                    <Link href="/guide" className="text-white/70 transition hover:text-white">
                      使い方
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] px-0 lg:px-6">
          <div className="lg:flex lg:gap-6">
            {/* 左：広告（狭いPCでは非表示） */}
            <aside className="hidden shrink-0 2xl:block w-[300px]">
              <div className="sticky top-4">
                <div className="min-h-[600px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-xs font-semibold text-muted">広告</p>
                  <div className="mt-2 min-h-[560px] rounded-xl bg-white/[0.02]" />
                </div>
              </div>
            </aside>

            {/* 中：メイン */}
            <div className="min-w-0 flex-1">
              <div className="w-full max-w-[960px]">
                {children}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto w-full border-t border-white/[0.08] bg-bg0/80 backdrop-blur-xl">
          <nav
            aria-label="フッター"
            className="mx-auto w-full max-w-xl px-4 py-6"
          >
            {/* サイトマップ系 */}
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm whitespace-nowrap">
              <li>
                <Link href="/judge" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  設定判別ツール
                </Link>
              </li>
              <li>
                <Link href="/machines" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  機種一覧
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  コミュニティ
                </Link>
              </li>
              <li>
                <Link href="/record" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  収支表
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  使い方
                </Link>
              </li>
            </ul>

            {/* 法的・ポリシー系 */}
            <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm whitespace-nowrap">
              <li>
                <Link href="/privacy" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  運営情報
                </Link>
              </li>
            </ul>

            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <li>
                <Link href="/disclaimer" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  免責事項
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/tokusho" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  よくある質問（FAQ）
                </Link>
              </li>
              <li>
                <Link href="/column" className="text-white/60 underline underline-offset-2 transition hover:text-white">
                  コラム
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/30">
              © {new Date().getFullYear()} スロット設定判別ツール
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-white/20">
              ※ 本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
            </p>

            <GmoSiteSeal />
          </nav>
        </footer>
      </body>
    </html>
  );
}
