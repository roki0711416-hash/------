"use client";

import Link from "next/link";

export default function IosTopPage() {
  return (
    <main className="ios-main">
      <section className="ios-card ios-section">
        <h1 className="ios-h1">アプリ用TOP</h1>
        <p className="ios-text">
          設定判別・機種検索・収支記録など、よく使う機能へすぐ移動できます。
        </p>
      </section>

      <section className="ios-card ios-section">
        <h2 className="ios-h2">主要メニュー</h2>
        <div className="ios-grid">
          <Link href="/ios/judge" className="ios-tile ios-primary">
            設定判別
          </Link>
          <Link href="/ios/machines" className="ios-tile">
            機種一覧
          </Link>
          <Link href="/ios/record" className="ios-tile">
            収支表
          </Link>
          <Link href="/ios/howto" className="ios-tile">
            使い方
          </Link>
        </div>
      </section>

      <section className="ios-card ios-section">
        <h2 className="ios-h2">新着</h2>
        <p className="ios-text">（準備中）アプリ用のお知らせを表示します。</p>
      </section>
    </main>
  );
}
