"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Machine = {
  id: string;
  name: string;
};

type MachineWithMaker = Machine & {
  makerName: string;
};

type Maker = {
  name: string;
  machines: Machine[];
};

type Props = {
  makers: Maker[];
  selectedMaker?: string;
  selectedMachine?: string;
};

export default function SideMenu({
  makers,
  selectedMaker,
  selectedMachine,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [openMaker, setOpenMaker] = useState<string | null>(selectedMaker ?? null);
  const [machineQuery, setMachineQuery] = useState("");
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isOpen]);

  const makersByName = useMemo(() => {
    const map = new Map<string, Maker>();
    for (const m of makers) map.set(m.name, m);
    return map;
  }, [makers]);

  const effectiveOpenMaker = openMaker ?? makers[0]?.name ?? null;
  const machinesForOpenMaker = useMemo(() => {
    if (!effectiveOpenMaker) return [];
    return makersByName.get(effectiveOpenMaker)?.machines ?? [];
  }, [effectiveOpenMaker, makersByName]);

  const allMachines: MachineWithMaker[] = useMemo(() => {
    return makers.flatMap((mk) =>
      mk.machines.map((mc) => ({ ...mc, makerName: mk.name })),
    );
  }, [makers]);

  const machinesForOpenMakerWithMaker: MachineWithMaker[] = useMemo(() => {
    if (!effectiveOpenMaker) return [];
    return machinesForOpenMaker.map((mc) => ({ ...mc, makerName: effectiveOpenMaker }));
  }, [effectiveOpenMaker, machinesForOpenMaker]);

  const normalizedQuery = useMemo(() => {
    return machineQuery
      .replace(/\u3000/g, " ")
      .trim()
      .toLowerCase();
  }, [machineQuery]);

  const filteredMachines: MachineWithMaker[] = useMemo(() => {
    const base: MachineWithMaker[] = normalizedQuery
      ? allMachines
      : machinesForOpenMakerWithMaker;

    if (!normalizedQuery) return base;

    return base.filter((mc) =>
      mc.name
        .replace(/\u3000/g, " ")
        .replace(/^スマスロ\s*/u, "L ")
        .replace(/^スマスロ/u, "L")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allMachines, machinesForOpenMakerWithMaker, normalizedQuery]);

  function displayMachineName(name: string) {
    return name.replace(/^スマスロ\s*/u, "L ").replace(/^スマスロ/u, "L");
  }

  function buildToolUrl(nextMaker: string | null, nextMachine: string) {
    const sp = new URLSearchParams();
    if (nextMaker) sp.set("maker", nextMaker);
    sp.set("machine", nextMachine);
    return `/tool?${sp.toString()}`;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="メニュー"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
      >
        ≡ 機種
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-[70] mt-2 w-[min(92vw,520px)] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0b1026]/95 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-white/[0.08] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">機種選択</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
              >
                閉じる
              </button>
            </div>

            <label className="mt-2 block min-w-0">
              <span className="sr-only">機種を検索</span>
              <input
                value={machineQuery}
                onChange={(e) => setMachineQuery(e.target.value)}
                placeholder="機種を検索…"
                className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.24] focus:bg-white/[0.1]"
              />
            </label>

            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {makers.map((mk) => {
                const isActive = mk.name === effectiveOpenMaker;
                return (
                  <button
                    key={mk.name}
                    type="button"
                    onClick={() => {
                      setOpenMaker(mk.name);
                      setMachineQuery("");
                    }}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                      isActive
                        ? "border-white/25 bg-white/[0.14] text-white"
                        : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    {mk.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-h-[52vh] overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredMachines.map((mc) => {
                const isSelected =
                  mc.id === selectedMachine &&
                  (normalizedQuery
                    ? mc.makerName === selectedMaker
                    : effectiveOpenMaker === selectedMaker);
                return (
                  <button
                    key={mc.id}
                    type="button"
                    onClick={() => {
                      const makerForSelected = normalizedQuery
                        ? mc.makerName
                        : effectiveOpenMaker;
                      router.push(buildToolUrl(makerForSelected, mc.id));
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 whitespace-normal break-words transition ${
                      isSelected
                        ? "bg-white/[0.12] font-semibold text-white"
                        : "text-white/75 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{displayMachineName(mc.name)}</span>
                    {normalizedQuery ? (
                      <span className="ml-2 text-xs text-white/45">({mc.makerName})</span>
                    ) : null}
                  </button>
                );
              })}

              {makers.length === 0 ? (
                <p className="px-2 py-2 text-sm text-muted">機種データがありません。</p>
              ) : null}

              {makers.length > 0 && filteredMachines.length === 0 ? (
                <p className="px-2 py-2 text-sm text-muted">
                  {normalizedQuery ? "検索結果がありません。" : "機種がありません。"}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
