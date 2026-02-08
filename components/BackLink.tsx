"use client";

import { useRouter } from "next/navigation";

export default function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.push("/ios");
      }}
      className="mt-2 inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
    >
      ← TOPに戻る
    </button>
  );
}
