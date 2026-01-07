"use client";

import Script from "next/script";
import { useEffect, useId, useState } from "react";

type Props = {
  profileUrl: string;
  latestThreadUrl?: string;
};

export default function LatestXCard({ profileUrl, latestThreadUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const regionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    if (!scriptReady) return;

    const w = window as unknown as { twttr?: { widgets: { load: () => void } } };
    w.twttr?.widgets?.load?.();
  }, [isOpen, scriptReady]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">最新ポスト</h2>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={regionId}
          onClick={() => setIsOpen((v) => !v)}
          className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm font-medium"
        >
          {isOpen ? "閉じる" : "開く"}
        </button>
      </div>

      <p className="mt-3 text-sm text-neutral-600">
        表示が重いので、必要な時だけ開けるようにしています。
      </p>

      {latestThreadUrl ? (
        <p className="mt-2 text-sm">
          <a
            href={latestThreadUrl}
            target="_blank"
            rel="noreferrer"
            className="text-neutral-900 underline"
          >
            最新スレッドを見る
          </a>
        </p>
      ) : null}

      {isOpen ? (
        <div id={regionId} className="mt-4">
          <Script
            src="https://platform.twitter.com/widgets.js"
            strategy="lazyOnload"
            onLoad={() => setScriptReady(true)}
          />
          <a
            className="twitter-timeline"
            href={profileUrl}
            aria-label="X タイムライン"
          >
            Posts by X
          </a>
        </div>
      ) : null}
    </div>
  );
}
