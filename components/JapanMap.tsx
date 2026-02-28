"use client";

import { REGION_DEFS, RegionKey, getRegionLabel } from "@/lib/prefectures";

type Props = {
  selectedRegion: RegionKey | null;
  onSelectRegion: (region: RegionKey) => void;
};

const REGION_POSITIONS: Record<RegionKey, { x: number; y: number; w: number; h: number }> = {
  hokkaido_tohoku: { x: 120, y: 12, w: 118, h: 78 },
  kanto: { x: 150, y: 102, w: 92, h: 62 },
  chubu: { x: 96, y: 106, w: 92, h: 62 },
  kinki: { x: 64, y: 176, w: 80, h: 56 },
  chugoku: { x: 12, y: 176, w: 80, h: 56 },
  shikoku: { x: 56, y: 242, w: 84, h: 42 },
  kyushu_okinawa: { x: 6, y: 242, w: 64, h: 84 },
};

const REGION_COLORS: Record<RegionKey, string> = {
  hokkaido_tohoku: "#67e8f9",
  kanto: "#86efac",
  chubu: "#fcd34d",
  kinki: "#f9a8d4",
  chugoku: "#fdba74",
  shikoku: "#c4b5fd",
  kyushu_okinawa: "#fda4af",
};

export default function JapanMap({ selectedRegion, onSelectRegion }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.03] p-4">
      <h3 className="text-xs font-semibold text-white/40">地方ブロック選択</h3>
      <p className="mt-0.5 text-[10px] leading-relaxed text-white/30">地方を選択すると該当する都道府県一覧を表示します</p>

      <svg viewBox="0 0 248 336" className="mt-2 w-full rounded-xl bg-white/[0.04] p-2 opacity-70 transition hover:opacity-100" role="img" aria-label="地方ブロック選択">
        {REGION_DEFS.map((region) => {
          const block = REGION_POSITIONS[region.key];
          const isSelected = selectedRegion === region.key;

          return (
            <g
              key={region.key}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRegion(region.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRegion(region.key);
                }
              }}
              className="cursor-pointer"
              aria-label={getRegionLabel(region.key)}
            >
              <rect
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx={12}
                fill={REGION_COLORS[region.key]}
                opacity={isSelected ? 1 : 0.5}
                stroke={isSelected ? "#0f172a" : "#94a3b8"}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 + 4}
                textAnchor="middle"
                className="fill-white"
                style={{ fontSize: 11, fontWeight: 700, pointerEvents: "none" }}
              >
                {region.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
