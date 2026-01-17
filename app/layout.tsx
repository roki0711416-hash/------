import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import HeaderMachineSearchBox from "../components/HeaderMachineSearchBox";

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
      <body className="min-h-screen bg-neutral-100 text-neutral-900">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6861979311690077"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <header className="w-full border-b border-neutral-200 bg-white">
          {/* SP: 現状維持 */}
          <Link href="/" aria-label="トップへ" className="block lg:hidden">
            <Image
              src="/header.jpg"
              alt="スロカスくん"
              width={1536}
              height={263}
              priority
              sizes="100vw"
              className="h-auto w-full md:hidden"
            />

            {/* タブレット：従来のPCヘッダー画像 */}
            <div className="hidden w-full py-2 md:block lg:hidden">
              <div className="relative h-[100px] w-full overflow-hidden">
                <Image
                  src="/header.jpg"
                  alt="スロカスくん"
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </Link>

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
                      href="/login"
                      className="text-neutral-700 underline underline-offset-2"
                    >
                      ログイン
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
                  <li>
                    <Link
                      href="/terms"
                      className="text-neutral-700 underline underline-offset-2"
                    >
                      利用規約
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        {children}
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
          </nav>
        </footer>
      </body>
    </html>
  );
}
