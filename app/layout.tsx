import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import HeaderMachineSearchBox from "../components/HeaderMachineSearchBox";
import GmoSiteSeal from "../components/GmoSiteSeal";
import GlobalAd from "../components/GlobalAd";
import { getCurrentUserFromCookies } from "../lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUserFromCookies();
  const isLoggedIn = !!user;

  return (
    <html lang="ja">
      <body className="min-h-screen bg-neutral-100 text-neutral-900">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
  try {
    var choice = localStorage.getItem('slokasu_theme') || 'system';
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var applied = (choice === 'system') ? (mql.matches ? 'dark' : 'light') : choice;
    document.documentElement.dataset.theme = applied;
  } catch (e) {}
})();`}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6861979311690077"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <header className="w-full border-b border-neutral-200 bg-white bg-orange-500">
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
                  <span className="text-base font-semibold text-neutral-900">スロカスくん</span>
                </Link>

                <div className="flex shrink-0 items-center gap-3">
                  {isLoggedIn ? (
                    <span className="text-sm font-semibold text-neutral-700">ログイン中</span>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-neutral-700 underline underline-offset-2"
                    >
                      ログイン
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <HeaderMachineSearchBox />
              </div>
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
                <span className="text-base font-semibold text-neutral-900">スロカスくん</span>
              </Link>

              <div className="flex-1">
                <HeaderMachineSearchBox />
              </div>

              <nav aria-label="ヘッダー" className="shrink-0">
                <ul className="flex items-center justify-end gap-5 text-sm font-medium">
                  <li>
                    <Link
                      href="/about"
                      className="text-neutral-700 underline underline-offset-2"
                    >
                      運営情報
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-neutral-700 underline underline-offset-2"
                    >
                      利用規約
                    </Link>
                  </li>
                  <li>
                    {isLoggedIn ? (
                      <span className="text-neutral-700">ログイン中</span>
                    ) : (
                      <Link
                        href="/login"
                        className="text-neutral-700 underline underline-offset-2"
                      >
                        ログイン
                      </Link>
                    )}
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
                <div className="min-h-[600px] rounded-2xl border border-neutral-200 bg-white p-3">
                  <p className="text-xs font-semibold text-neutral-500">広告</p>
                  <div className="mt-2 min-h-[560px] rounded-xl bg-neutral-50" />
                </div>
              </div>
            </aside>

            {/* 中：メイン */}
            <div className="min-w-0 flex-1">
              <div className="w-full xl:max-w-[900px] 2xl:max-w-[960px]">
                {children}
              </div>
            </div>

            {/* 右：情報（狭いPCでは非表示） */}
            <aside className="hidden shrink-0 xl:block w-[280px]">
              <div className="sticky top-4 space-y-4">
                <section className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <h2 className="text-sm font-semibold text-neutral-900">ショートカット</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>
                      <Link href="/judge" className="text-neutral-700 underline underline-offset-2">
                        設定判別ツールへ
                      </Link>
                    </li>
                    <li>
                      <Link href="/machines" className="text-neutral-700 underline underline-offset-2">
                        機種一覧へ
                      </Link>
                    </li>
                    <li>
                      <Link href="/guide" className="text-neutral-700 underline underline-offset-2">
                        使い方
                      </Link>
                    </li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <h2 className="text-sm font-semibold text-neutral-900">情報</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>
                      <Link href="/" className="text-neutral-700 underline underline-offset-2">
                        新着情報を見る
                      </Link>
                    </li>
                    <li>
                      <Link href="/account" className="text-neutral-700 underline underline-offset-2">
                        アカウント
                      </Link>
                    </li>
                    <li>
                      <Link href="/record" className="text-neutral-700 underline underline-offset-2">
                        収支表
                      </Link>
                    </li>
                    <li>
                      <Link href="/community" className="text-neutral-700 underline underline-offset-2">
                        コミュニティ
                      </Link>
                    </li>
                  </ul>
                </section>
              </div>
            </aside>
          </div>
        </div>

        {/* Global Ad (mobile only): shown just before footer */}
        <GlobalAd />

        <footer className="mt-auto w-full border-t border-neutral-200 bg-white">
          <nav
            aria-label="フッター"
            className="mx-auto w-full max-w-xl px-4 py-6"
          >
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  免責事項
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/tokusho"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  よくある質問（FAQ）
                </Link>
              </li>
              <li>
                <Link
                  href="/cancel"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  解約方法
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-700 underline underline-offset-2"
                >
                  運営情報
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              © {new Date().getFullYear()} スロット設定判別ツール
            </p>

            <GmoSiteSeal />
          </nav>
        </footer>
      </body>
    </html>
  );
}
