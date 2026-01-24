import { getBaseUrl } from "../lib/baseUrl";

type Props = {
  profileUrl: string;
  latestThreadUrl?: string;
};

type ApiTweet = {
  id: string;
  createdAt: string;
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

export default async function LatestXCard({ profileUrl, latestThreadUrl }: Props) {
  let tweets: ApiTweet[] = [];
  try {
    const res = await fetch(`${getBaseUrl()}/api/x/latest`, { next: { revalidate: 300 } });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; tweets?: ApiTweet[] }
      | null;
    tweets = Array.isArray(json?.tweets) ? json!.tweets! : [];
  } catch {
    tweets = [];
  }

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

      <p className="mt-3 text-sm text-neutral-600">最新ツイート（最大3件）を表示します。</p>

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

      {tweets.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm text-neutral-800">
          {tweets.map((t) => (
            <li key={t.id}>
              <div className="text-xs text-neutral-500">{formatDateTimeJst(t.createdAt)}</div>
              <div className="mt-1 whitespace-pre-wrap">{truncateText(t.text, 140)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-neutral-600">最新ポストを取得できませんでした。</p>
      )}
    </div>
  );
}
