"use client";

import { useState } from "react";
import Link from "next/link";

interface PrefItem {
  slug: string;
  name: string;
}

export default function PrefectureSearch({ prefs }: { prefs: PrefItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? prefs.filter((p) => p.name.includes(query) || p.slug.includes(query.toLowerCase()))
    : prefs;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="都道府県名で検索…"
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
      />
      {query && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-400">該当する都道府県がありません</p>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/prefectures/${p.slug}`}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
              >
                {p.name}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
