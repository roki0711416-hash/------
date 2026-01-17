"use client";

import { useEffect, useRef } from "react";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "slokasu_theme";

function normalizeChoice(v: unknown): ThemeChoice {
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

function getStoredChoice(): ThemeChoice {
  try {
    return normalizeChoice(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

function applyTheme(choice: ThemeChoice) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const applied = choice === "system" ? (mql.matches ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = applied;
}

export default function ThemeSettings() {
  const choiceRef = useRef<ThemeChoice>("system");
  const selectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const stored = getStoredChoice();
    choiceRef.current = stored;
    applyTheme(stored);
    if (selectRef.current) selectRef.current.value = stored;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (choiceRef.current === "system") applyTheme("system");
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Safari fallback (legacy API)
    const legacy = mql as unknown as {
      addListener?: (cb: () => void) => void;
      removeListener?: (cb: () => void) => void;
    };
    legacy.addListener?.(onChange);
    return () => legacy.removeListener?.(onChange);
  }, []);

  function update(next: ThemeChoice) {
    choiceRef.current = next;
    if (selectRef.current) selectRef.current.value = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-semibold text-neutral-900">表示設定</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-700">テーマ</p>
        <select
          ref={selectRef}
          defaultValue="system"
          onChange={(e) => update(normalizeChoice(e.target.value))}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
        >
          <option value="system">自動</option>
          <option value="light">明るい</option>
          <option value="dark">暗い</option>
        </select>
      </div>
    </section>
  );
}
