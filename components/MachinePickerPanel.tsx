"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ───────────────────────────────────────────────── */

type Machine = { id: string; name: string };
type MachineWithMaker = Machine & { makerName: string };
type Maker = { name: string; machines: Machine[] };

type Props = {
  makers: Maker[];
  selectedMaker?: string;
  selectedMachine?: string;
};

/* ─── Helpers ─────────────────────────────────────────────── */

function displayMachineName(name: string) {
  return name.replace(/^スマスロ\s*/u, "L ").replace(/^スマスロ/u, "L");
}

function buildToolUrl(maker: string | null, machine: string) {
  const sp = new URLSearchParams();
  if (maker) sp.set("maker", maker);
  sp.set("machine", machine);
  return `/tool?${sp.toString()}`;
}

/* ─── Inner: picker list (shared by sidebar & drawer) ────── */

function PickerBody({
  makers,
  selectedMaker,
  selectedMachine,
  onSelect,
}: {
  makers: Maker[];
  selectedMaker?: string;
  selectedMachine?: string;
  onSelect: (maker: string, machineId: string) => void;
}) {
  const [openMaker, setOpenMaker] = useState<string | null>(
    selectedMaker ?? makers[0]?.name ?? null,
  );
  const [query, setQuery] = useState("");

  const allMachines: MachineWithMaker[] = useMemo(
    () =>
      makers.flatMap((mk) =>
        mk.machines.map((mc) => ({ ...mc, makerName: mk.name })),
      ),
    [makers],
  );

  const normalizedQuery = useMemo(
    () => query.replace(/\u3000/g, " ").trim().toLowerCase(),
    [query],
  );

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

  return (
    <>
      {/* search */}
      <div className="p-3">
        <label className="block">
          <span className="sr-only">機種を検索</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="機種を検索…"
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.24] focus:bg-white/[0.1]"
          />
        </label>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {normalizedQuery ? (
          /* ── search results ── */
          <div className="space-y-1">
            {filteredMachines.map((mc) => {
              const isSelected =
                mc.id === selectedMachine && mc.makerName === selectedMaker;
              return (
                <button
                  key={`${mc.makerName}:${mc.id}`}
                  type="button"
                  onClick={() => onSelect(mc.makerName, mc.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 whitespace-normal break-words transition ${
                    isSelected
                      ? "bg-indigo-500/25 font-semibold text-white ring-1 ring-indigo-400/40"
                      : "text-white/75 hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{displayMachineName(mc.name)}</span>
                  <span className="ml-2 text-xs text-white/45">
                    ({mc.makerName})
                  </span>
                </button>
              );
            })}
            {filteredMachines.length === 0 && (
              <p className="px-2 py-2 text-sm text-muted">
                検索結果がありません。
              </p>
            )}
          </div>
        ) : (
          /* ── maker accordion ── */
          <div className="space-y-2">
            {makers.map((mk) => {
              const isOpen = mk.name === openMaker;
              return (
                <section
                  key={mk.name}
                  className="rounded-xl border border-white/[0.1] bg-[#121938]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMaker((prev) =>
                        prev === mk.name ? null : mk.name,
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
                  >
                    <span className="text-sm font-semibold text-white/85">
                      {mk.name}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-white/45">
                      <span>{mk.machines.length}</span>
                      <span aria-hidden>{isOpen ? "▴" : "▾"}</span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-1 border-t border-white/[0.06] p-2">
                      {mk.machines.map((mc) => {
                        const isSelected =
                          mc.id === selectedMachine &&
                          mk.name === selectedMaker;
                        return (
                          <button
                            key={mc.id}
                            type="button"
                            onClick={() => onSelect(mk.name, mc.id)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 whitespace-normal break-words transition ${
                              isSelected
                                ? "bg-indigo-500/25 font-semibold text-white ring-1 ring-indigo-400/40"
                                : "text-white/75 hover:bg-white/[0.06]"
                            }`}
                          >
                            {displayMachineName(mc.name)}
                          </button>
                        );
                      })}
                      {mk.machines.length === 0 && (
                        <p className="px-2 py-2 text-sm text-muted">
                          機種がありません。
                        </p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
            {makers.length === 0 && (
              <p className="px-2 py-2 text-sm text-muted">
                機種データがありません。
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────── */

export default function MachinePickerPanel({
  makers,
  selectedMaker,
  selectedMachine,
}: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  /* lock body scroll while drawer is open */
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  function handleSelect(maker: string, machineId: string) {
    router.push(buildToolUrl(maker, machineId));
    setDrawerOpen(false);
  }

  return (
    <>
      {/* ── Mobile: toggle button (md以下) ── */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
        >
          <span aria-hidden>≡</span>
          <span>機種を選択</span>
        </button>
      </div>

      {/* ── Mobile: drawer overlay (md以下) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* backdrop */}
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          {/* drawer panel */}
          <div
            ref={drawerRef}
            className="absolute inset-y-0 left-0 flex w-[85vw] max-w-[360px] flex-col bg-[#0b1026] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <h2 className="text-sm font-bold text-white">機種選択</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.08]"
              >
                ✕ 閉じる
              </button>
            </div>
            <PickerBody
              makers={makers}
              selectedMaker={selectedMaker}
              selectedMachine={selectedMachine}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}

      {/* ── Desktop: always-visible sidebar (md以上) ── */}
      <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1026] md:flex">
        <div className="border-b border-white/[0.08] px-4 py-3">
          <h2 className="text-sm font-bold text-white">機種選択</h2>
        </div>
        <PickerBody
          makers={makers}
          selectedMaker={selectedMaker}
          selectedMachine={selectedMachine}
          onSelect={handleSelect}
        />
      </aside>
    </>
  );
}
