"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 200;

export default function BackToTop() {
  const enabled = process.env.NEXT_PUBLIC_SHOW_FLOATING_UI === "true";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled]);

  if (!enabled) return null;

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[90px] right-4 z-50 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/[0.07] active:scale-[0.99]"
      aria-label="TOPへ戻る"
    >
      ↑ TOPへ
    </button>
  );
}
