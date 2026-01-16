"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommunityReplyForm({
  threadId,
  username,
}: {
  threadId: string;
  username?: string;
}) {
  const router = useRouter();

  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setError(null);
    setDone(false);

    const b = body.trim();
    if (!b) return setError("本文を入力してください。");
    if (b.length > 1000) return setError("本文は1000文字以内で入力してください。");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ threadId, body: b }),
      });

      const json = (await res.json().catch(() => null)) as
        | { ok: true; id: string; postNo: number }
        | { error: string }
        | null;

      if (!res.ok) {
        const msg = json && typeof json === "object" && "error" in json ? String(json.error) : "投稿に失敗しました。";
        setError(msg);
        return;
      }

      setBody("");
      setDone(true);
      router.refresh();
    } catch {
      setError("投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold">レスする</p>
      {username ? <p className="mt-1 text-xs text-neutral-600">投稿者: {username}</p> : null}

      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">本文</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="例: 自分は○○でした"
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-neutral-500">1000文字まで</p>
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {done ? <p className="text-sm font-medium text-neutral-700">投稿しました。</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          書き込む
        </button>

        <p className="text-xs text-neutral-500">※有料会員限定。ユーザーネーム固定で投稿されます。</p>
      </div>
    </div>
  );
}
