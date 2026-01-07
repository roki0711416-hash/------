"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReviewRating } from "../content/reviews";

type ReviewItem = {
  id: string;
  machineId: string;
  date: string;
  rating: ReviewRating;
  author?: string;
  body: string;
};

const STORAGE_KEY = "slokasu:reviews:v2";

type ApiReview = {
  id: string;
  machine_id: string;
  date: string;
  rating: number;
  author: string | null;
  body: string;
};

function normalizeApiReview(r: ApiReview) {
  return {
    id: r.id,
    machineId: r.machine_id,
    date: r.date,
    rating: (Math.max(1, Math.min(5, Math.trunc(r.rating))) as ReviewRating),
    author: r.author ?? undefined,
    body: r.body,
  } satisfies ReviewItem;
}

function renderStars(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function todayJstYmd() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const jst = new Date(utc + 9 * 60 * 60_000);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function safeParseLocalReviews(raw: string | null): ReviewItem[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const out: ReviewItem[] = [];
    for (const item of data) {
      if (typeof item !== "object" || item === null) continue;
      const r = item as Record<string, unknown>;
      if (
        typeof r.id === "string" &&
        typeof r.machineId === "string" &&
        typeof r.date === "string" &&
        (r.rating === 1 || r.rating === 2 || r.rating === 3 || r.rating === 4 || r.rating === 5) &&
        typeof r.body === "string" &&
        (typeof r.author === "string" || typeof r.author === "undefined")
      ) {
        out.push({
          id: r.id,
          machineId: r.machineId,
          date: r.date,
          rating: r.rating,
          body: r.body,
          author: r.author,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function saveLocalReviews(all: ReviewItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export default function MachineReviewsCard({
  machineId,
}: {
  machineId: string;
}) {
  const [mode, setMode] = useState<"server" | "local">("server");
  const [serverReviews, setServerReviews] = useState<ReviewItem[]>([]);
  const [localReviewsAll, setLocalReviewsAll] = useState<ReviewItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [rating, setRating] = useState<ReviewRating>(5);
  const [author, setAuthor] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // localStorage から初回ロード（クライアントのみ）
    setLocalReviewsAll(safeParseLocalReviews(localStorage.getItem(STORAGE_KEY)));
  }, []);

  async function load() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/reviews?machineId=${encodeURIComponent(machineId)}`);
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : "口コミの読み込みに失敗しました。";

        // 共有DB未設定(503)ならローカル保存に切り替え
        if (res.status === 503) {
          setMode("local");
          setLoadError("共有口コミが利用できないため、この端末の口コミを表示しています。");
        } else {
          setLoadError(msg);
        }

        setServerReviews([]);
        return;
      }

      setMode("server");
      const items =
        typeof json === "object" && json !== null && "reviews" in json
          ? (json as { reviews: unknown }).reviews
          : [];

      if (!Array.isArray(items)) {
        setServerReviews([]);
        return;
      }

      const normalized: ReviewItem[] = [];
      for (const item of items) {
        if (typeof item !== "object" || item === null) continue;
        const r = item as Record<string, unknown>;
        if (
          typeof r.id === "string" &&
          typeof r.machine_id === "string" &&
          typeof r.date === "string" &&
          typeof r.rating === "number" &&
          typeof r.body === "string" &&
          (typeof r.author === "string" || r.author === null)
        ) {
          normalized.push(
            normalizeApiReview({
              id: r.id,
              machine_id: r.machine_id,
              date: r.date,
              rating: r.rating,
              author: r.author as string | null,
              body: r.body,
            }),
          );
        }
      }
      setServerReviews(normalized);
    } catch {
      // ネットワーク不調などでも最低限は端末内で使えるようにする
      setMode("local");
      setLoadError(
        "共有口コミの読み込みに失敗したため、この端末の口コミを表示しています。",
      );
      setServerReviews([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineId]);

  const localForMachine = useMemo(
    () => localReviewsAll.filter((r) => r.machineId === machineId),
    [localReviewsAll, machineId],
  );

  const userReviews = mode === "server" ? serverReviews : localForMachine;

  const avg = useMemo(() => {
    if (userReviews.length === 0) return null;
    return userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;
  }, [userReviews]);

  async function submit() {
    setSubmitted(false);
    setSubmitError(null);

    const trimmedBody = body.trim();
    const trimmedAuthor = author.trim();

    if (trimmedBody.length === 0) {
      setSubmitError("口コミ本文を入力してください。");
      return;
    }
    if (trimmedBody.length > 500) {
      setSubmitError("口コミ本文は500文字以内で入力してください。");
      return;
    }
    if (trimmedAuthor.length > 20) {
      setSubmitError("名前は20文字以内で入力してください。");
      return;
    }

    try {
      if (mode === "local") {
        const id = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const review: ReviewItem = {
          id,
          machineId,
          date: todayJstYmd(),
          rating,
          author: trimmedAuthor || undefined,
          body: trimmedBody,
        };
        const nextAll = [review, ...localReviewsAll];
        setLocalReviewsAll(nextAll);
        saveLocalReviews(nextAll);
        setBody("");
        setSubmitted(true);
        return;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          machineId,
          rating,
          author: trimmedAuthor || undefined,
          body: trimmedBody,
        }),
      });
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        if (res.status === 503) {
          // 共有DB未設定ならその場でローカル保存に切り替える
          setMode("local");
          const id = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const review: ReviewItem = {
            id,
            machineId,
            date: todayJstYmd(),
            rating,
            author: trimmedAuthor || undefined,
            body: trimmedBody,
          };
          const nextAll = [review, ...localReviewsAll];
          setLocalReviewsAll(nextAll);
          saveLocalReviews(nextAll);
          setBody("");
          setSubmitted(true);
          return;
        }

        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : "投稿に失敗しました。";
        setSubmitError(msg);
        return;
      }

      setBody("");
      setSubmitted(true);
      await load();
    } catch {
      // ネットワーク不調時も投稿自体は端末内で成立させる
      setMode("local");
      const id = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const review: ReviewItem = {
        id,
        machineId,
        date: todayJstYmd(),
        rating,
        author: trimmedAuthor || undefined,
        body: trimmedBody,
      };
      const nextAll = [review, ...localReviewsAll];
      setLocalReviewsAll(nextAll);
      saveLocalReviews(nextAll);
      setBody("");
      setSubmitted(true);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">ユーザー口コミ</h2>
      {avg !== null ? (
        <p className="mt-1 text-xs text-neutral-500">
          平均 {avg.toFixed(2)} / 5（{userReviews.length}件）
        </p>
      ) : null}

      {userReviews.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {userReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-800">
                  {renderStars(r.rating)}
                  <span className="ml-2 text-xs font-medium text-neutral-500">
                    {r.rating}/5
                  </span>
                </p>
                <p className="text-xs text-neutral-500">
                  {r.date}
                  {r.author ? `・${r.author}` : ""}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-neutral-600">まだ口コミがありません。</p>
      )}

      {isLoading ? (
        <p className="mt-3 text-sm text-neutral-600">読み込み中…</p>
      ) : null}

      {loadError ? (
        <p className="mt-3 text-sm font-medium text-red-600">{loadError}</p>
      ) : null}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold">口コミを書く</p>
        {mode === "server" ? (
          <p className="mt-1 text-xs text-neutral-500">※投稿はみんなに共有されます。</p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">
            ※この端末のブラウザに保存されます（他の人には共有されません）。共有DBが使えるようになれば自動で共有に戻ります。
          </p>
        )}

        <div className="mt-3 grid gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">評価</span>
            <select
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value) as ReviewRating)}
            >
              <option value={5}>5（最高）</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1（最低）</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">名前（任意）</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              placeholder="例: 匿名"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">口コミ</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              placeholder="例: 右上がりだったので6を期待したが…"
            />
          </label>

          {submitError ? (
            <p className="text-sm font-medium text-red-600">{submitError}</p>
          ) : null}
          {submitted ? (
            <p className="text-sm font-medium text-neutral-700">投稿しました。</p>
          ) : null}

          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            投稿する
          </button>
        </div>
      </div>
    </section>
  );
}
