"use client";

import { useId, useState } from "react";

type Props = {
  post:
    | {
        title: string;
        date: string;
        body: string;
      }
    | null;
};

export default function LatestPostCard({ post }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const regionId = useId();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">最新ポスト</h2>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={regionId}
          onClick={() => setIsOpen((v) => !v)}
          className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm font-medium"
        >
          {isOpen ? "閉じる" : "開く"}
        </button>
      </div>

      <p className="mt-3 text-sm text-muted">
        表示が重いので、必要な時だけ開けるようにしています。
      </p>

      {isOpen ? (
        <div
          id={regionId}
          className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"
        >
          {post ? (
            <>
              <p className="text-sm font-semibold">{post.title}</p>
              <p className="mt-1 text-xs text-white/40">{post.date}</p>
              <p className="mt-3 whitespace-pre-line text-sm text-muted">
                {post.body}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">まだポストがありません。</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
