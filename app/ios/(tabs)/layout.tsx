import type { ReactNode } from "react";
import Link from "next/link";

export default function IosTabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="ios-content">
        <div className="ios-container">{children}</div>
      </div>

      <nav className="ios-tabbar" aria-label="下部ナビ">
        <div className="ios-tabbar-inner">
          <Link href="/ios" className="ios-tab">
            ホーム
          </Link>
          <Link href="/ios/judge" className="ios-tab">
            判別
          </Link>
          <Link href="/ios/record" className="ios-tab">
            収支
          </Link>
          <Link href="/ios/machines" className="ios-tab">
            機種
          </Link>
          <Link href="/ios/howto" className="ios-tab">
            使い方
          </Link>
        </div>
      </nav>
    </>
  );
}
