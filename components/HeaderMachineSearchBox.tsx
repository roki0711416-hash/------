"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderMachineSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit() {
    const q = query.trim();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    const url = sp.toString() ? `/machines?${sp.toString()}` : "/machines";
    router.push(url);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="w-full"
    >
      <label className="flex w-full items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 backdrop-blur-sm transition focus-within:border-white/25 focus-within:bg-white/[0.1]">
        <span className="sr-only">機種を検索</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="機種を検索…"
          className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          検索
        </button>
      </label>
    </form>
  );
}
