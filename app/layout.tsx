import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "スロット設定判別ツール",
  description: "スロットの設定判別を補助するWebツール",
  verification: {
    google: "QqbnEFPRBiH4haH8",
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
      <body className="min-h-screen bg-neutral-100 text-neutral-900">
        <header className="w-full border-b border-neutral-200 bg-white">
          <div className="w-full">
            <Link href="/" aria-label="トップへ" className="block">
              <Image
                src="/header.jpg"
                alt="スロカスくん"
                width={1536}
                height={263}
                priority
                className="h-auto w-full"
              />
            </Link>
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
