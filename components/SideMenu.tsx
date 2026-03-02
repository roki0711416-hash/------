"use client";

import { useMemo, useState } from "react";
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
    <>
      <button
        type="button"
        aria-label="メニュー"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium"
      >
        ≡
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
          />

          <div className="absolute inset-y-0 left-0 flex w-[94vw] max-w-[460px] flex-col overflow-hidden border-r border-white/[0.12] bg-[#0b1026]/95 shadow-2xl">
            <div className="border-b border-white/[0.08] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">機種一覧</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
                >
                  閉じる
                </button>
              </div>

              <label className="mt-3 block min-w-0">
                <span className="sr-only">機種を検索</span>
                <input
                  value={machineQuery}
                  onChange={(e) => setMachineQuery(e.target.value)}
                  placeholder="機種を検索…"
                  className="w-full rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.24] focus:bg-white/[0.1]"
                />
              </label>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-[42%,58%] gap-0 overflow-hidden">
              <div className="min-w-0 overflow-y-auto border-r border-white/[0.08] p-2">
                <p className="px-2 pb-2 text-xs font-semibold text-white/40">
                  メーカー
                </p>
                <div className="space-y-1">
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
                        className={`w-full rounded-lg px-2.5 py-2 text-left text-xs leading-5 whitespace-normal break-words transition ${
                          isActive
                            ? "bg-white/[0.12] font-semibold text-white"
                            : "text-white/65 hover:bg-white/[0.05]"
                        }`}
                      >
                        {mk.name}
                      </button>
                    );
                  })}
                  {makers.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-muted">
                      機種データがありません。
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 overflow-y-auto p-2">
                <p className="px-2 pb-2 text-xs font-semibold text-white/40">機種</p>

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
                            : "text-white/70 hover:bg-white/[0.05]"
                        }`}
                      >
                        {displayMachineName(mc.name)}
                      </button>
                    );
                  })}

                  {makers.length > 0 && filteredMachines.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-muted">
                      {normalizedQuery ? "検索結果がありません。" : "機種がありません。"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </>
  );
}
