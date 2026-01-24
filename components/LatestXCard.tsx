"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  profileUrl: string;
  latestThreadUrl?: string;
};

type ApiTweet = {
  id: string;
  created_at: string;
  text: string;
  url: string;
};

function formatDateTimeJst(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateText(text: string, maxChars = 140) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars)}…`;
}

export default function LatestXCard({ profileUrl, latestThreadUrl }: Props) {
  const [tweets, setTweets] = useState<ApiTweet[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/x/latest");
        const json = (await res.json().catch(() => null)) as
          | { ok?: boolean; tweets?: ApiTweet[] }
          | null;

        const nextTweets = Array.isArray(json?.tweets) ? json!.tweets! : [];
        if (cancelled) return;
        setTweets(nextTweets);
      } catch {
        if (cancelled) return;
        setFailed(true);
        setTweets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = useMemo(() => (tweets && tweets.length > 0 ? tweets[0] : null), [tweets]);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">最新ポスト</h2>
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm font-medium"
        >
          Xへ
        </a>
      </div>

      {failed ? (
        <p className="mt-3 text-sm text-neutral-600">
          表示が重いので、必要な時だけ開けるようにしています。
        </p>
      ) : null}

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

      {latest ? (
        <div className="mt-4 text-sm text-neutral-800">
          <div className="text-xs text-neutral-500">{formatDateTimeJst(latest.created_at)}</div>
          <div className="mt-1 whitespace-pre-wrap">{truncateText(latest.text, 140)}</div>
          <div className="mt-2">
            <a
              href={latest.url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 underline"
            >
              → 詳細を見る
            </a>
          </div>
        </div>
      ) : tweets ? null : (
        <div className="mt-4 h-10" />
      )}
    </div>
  );
}
