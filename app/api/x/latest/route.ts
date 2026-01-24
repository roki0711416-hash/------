import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;
export const dynamic = "force-static";

type XLatestTweet = {
  id: string;
  created_at: string;
  text: string;
  url: string;
};

function cacheHeaders() {
  // CDN向け（Vercel等）
  return {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
  };
}

export async function GET() {
  const bearer =
    process.env.X_BEARER_TOKEN?.trim() || process.env.TWITTER_BEARER_TOKEN?.trim() || "";
  const username = process.env.X_USERNAME?.trim() || "";

  if (!bearer || !username) {
    return NextResponse.json(
      {
        ok: false,
        error: !bearer
          ? "X APIのBearer Tokenが未設定です（X_BEARER_TOKEN）"
          : "Xのユーザー名が未設定です（X_USERNAME）",
        tweets: [] as XLatestTweet[],
      },
      { status: 200, headers: cacheHeaders() },
    );
  }

  const base = "https://api.x.com/2";
  const headers = {
    Authorization: `Bearer ${bearer}`,
  };

  // 1) username -> user id
  const userRes = await fetch(
    `${base}/users/by/username/${encodeURIComponent(username)}?user.fields=id`,
    { headers, next: { revalidate: 300 } },
  );

  if (!userRes.ok) {
    const text = await userRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: `X API user lookup failed: ${userRes.status}`,
        detail: text.slice(0, 500),
        tweets: [] as XLatestTweet[],
      },
      { status: 200, headers: cacheHeaders() },
    );
  }

  const userJson = (await userRes.json().catch(() => null)) as
    | { data?: { id?: string } }
    | null;

  const userId = userJson?.data?.id || "";
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "X API user id not found", tweets: [] as XLatestTweet[] },
      { status: 200, headers: cacheHeaders() },
    );
  }

  // 2) latest tweets
  const tweetsRes = await fetch(
    `${base}/users/${encodeURIComponent(
      userId,
    )}/tweets?max_results=5&exclude=retweets,replies&tweet.fields=created_at`,
    { headers, next: { revalidate: 300 } },
  );

  if (!tweetsRes.ok) {
    const text = await tweetsRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: `X API tweets lookup failed: ${tweetsRes.status}`,
        detail: text.slice(0, 500),
        tweets: [] as XLatestTweet[],
      },
      { status: 200, headers: cacheHeaders() },
    );
  }

  const tweetsJson = (await tweetsRes.json().catch(() => null)) as
    | { data?: Array<{ id: string; text: string; created_at?: string }> }
    | null;

  const tweets = (tweetsJson?.data ?? [])
    .slice(0, 3)
    .map((t) => {
      const created_at = t.created_at ?? "";
      return {
        id: t.id,
        created_at,
        text: t.text,
        url: `https://x.com/${username}/status/${t.id}`,
      } satisfies XLatestTweet;
    });

  return NextResponse.json(
    {
      ok: true,
      tweets,
    },
    { status: 200, headers: cacheHeaders() },
  );
}
