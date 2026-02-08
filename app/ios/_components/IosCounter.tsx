"use client";

import type { ChangeEvent } from "react";

export function IosCounter({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  placeholder,
  showInput = true,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  showInput?: boolean;
}) {
  const minV = Number.isFinite(min) ? Math.trunc(min) : 0;
  const maxV = typeof max === "number" && Number.isFinite(max) ? Math.trunc(max) : undefined;

  const clamp = (n: number) => {
    const v = Number.isFinite(n) ? Math.trunc(n) : 0;
    const clampedMin = Math.max(minV, v);
    if (maxV === undefined) return clampedMin;
    return Math.min(maxV, clampedMin);
  };

  const v = clamp(value);
  const canDec = v > minV;
  const canInc = maxV !== undefined ? v < maxV : true;

  const dec = () => onChange(clamp(v - step));
  const inc = () => onChange(clamp(v + step));

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    onChange(clamp(Number.isFinite(next) ? next : 0));
  };

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-zinc-600">{label}</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={!canDec}
          className="h-10 w-10 rounded-xl border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition active:bg-zinc-100 disabled:opacity-40"
          aria-label={`${label} を減らす`}
        >
          −
        </button>

        {showInput ? (
          <input
            type="number"
            value={String(v)}
            onChange={onInput}
            placeholder={placeholder}
            className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-center text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-400"
          />
        ) : (
          <div className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-center text-sm font-semibold leading-10 text-zinc-900">
            {v}
          </div>
        )}

        <button
          type="button"
          onClick={inc}
          disabled={!canInc}
          className="h-10 w-10 rounded-xl border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition active:bg-zinc-100 disabled:opacity-40"
          aria-label={`${label} を増やす`}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
