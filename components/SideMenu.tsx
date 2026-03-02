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
  const [openMaker, setOpenMaker] = useState<string | null>(
    selectedMaker ?? makers[0]?.name ?? null,
  );
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

  const effectiveOpenMaker = openMaker ?? selectedMaker ?? makers[0]?.name ?? null;

  const allMachines: MachineWithMaker[] = useMemo(() => {
    return makers.flatMap((mk) =>
      mk.machines.map((mc) => ({ ...mc, makerName: mk.name })),
    );
  }, [makers]);

  const normalizedQuery = useMemo(() => {
    return machineQuery
      .replace(/\u3000/g, " ")
      .trim()
      .toLowerCase();
  }, [machineQuery]);

  const filteredMachines: MachineWithMaker[] = useMemo(() => {
    if (!normalizedQuery) return [];
    return allMachines.filter((mc) =>
      mc.name
        .replace(/\u3000/g, " ")
        .replace(/^スマスロ\s*/u, "L ")
        .replace(/^スマスロ/u, "L")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [allMachines, normalizedQuery]);

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
        onClick={() => {
          if (!isOpen && !openMaker) {
            setOpenMaker(selectedMaker ?? makers[0]?.name ?? null);
          }
          setIsOpen((prev) => !prev);
        }}
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
            {normalizedQuery ? (
              <div className="space-y-1">
                {filteredMachines.map((mc) => {
                  const isSelected =
                    mc.id === selectedMachine && mc.makerName === selectedMaker;
                  return (
                    <button
                      key={`${mc.makerName}:${mc.id}`}
                      type="button"
                      onClick={() => {
                        router.push(buildToolUrl(mc.makerName, mc.id));
                        setOpenMaker(mc.makerName);
                        setIsOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 whitespace-normal break-words transition ${
                        isSelected
                          ? "bg-white/[0.12] font-semibold text-white"
                          : "text-white/75 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>{displayMachineName(mc.name)}</span>
                      <span className="ml-2 text-xs text-white/45">({mc.makerName})</span>
                    </button>
                  );
                })}

                {makers.length > 0 && filteredMachines.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted">検索結果がありません。</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                {makers.map((mk) => {
                  const isOpenMaker = mk.name === effectiveOpenMaker;
                  return (
                    <section
                      key={mk.name}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMaker((prev) => (prev === mk.name ? null : mk.name))
                        }
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                      >
                        <span className="text-sm font-semibold text-white/85">{mk.name}</span>
                        <span className="flex items-center gap-2 text-xs text-white/45">
                          <span>{mk.machines.length}</span>
                          <span aria-hidden>{isOpenMaker ? "▴" : "▾"}</span>
                        </span>
                      </button>

                      {isOpenMaker ? (
                        <div className="space-y-1 border-t border-white/[0.06] p-2">
                          {mk.machines.map((mc) => {
                            const isSelected =
                              mc.id === selectedMachine && mk.name === selectedMaker;
                            return (
                              <button
                                key={mc.id}
                                type="button"
                                onClick={() => {
                                  router.push(buildToolUrl(mk.name, mc.id));
                                  setIsOpen(false);
                                }}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 whitespace-normal break-words transition ${
                                  isSelected
                                    ? "bg-white/[0.12] font-semibold text-white"
                                    : "text-white/75 hover:bg-white/[0.06]"
                                }`}
                              >
                                {displayMachineName(mc.name)}
                              </button>
                            );
                          })}

                          {mk.machines.length === 0 ? (
                            <p className="px-2 py-2 text-sm text-muted">機種がありません。</p>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  );
                })}

                {makers.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted">機種データがありません。</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
