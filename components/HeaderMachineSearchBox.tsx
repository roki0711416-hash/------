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
      <label className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
        <span className="sr-only">機種を検索</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="機種を検索…"
          className="w-full bg-transparent text-sm text-neutral-900 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 text-sm font-semibold text-neutral-900"
        >
          検索
        </button>
      </label>
    </form>
  );
}
