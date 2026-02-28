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
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-white/[0.2]"
      />
      {query && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/30">該当する都道府県がありません</p>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/prefectures/${p.slug}`}
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium transition hover:bg-white/[0.07]"
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
