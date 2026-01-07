import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "スロット設定判別ツール",
  description: "スロットの設定判別を補助するWebツール",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
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
      </body>
    </html>
  );
}
