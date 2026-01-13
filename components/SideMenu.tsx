"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Machine = {
  id: string;
  name: string;
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

  const normalizedQuery = useMemo(() => {
    return machineQuery
      .replace(/\u3000/g, " ")
      .trim()
      .toLowerCase();
  }, [machineQuery]);

  const filteredMachinesForOpenMaker = useMemo(() => {
    if (!normalizedQuery) return machinesForOpenMaker;
    return machinesForOpenMaker.filter((mc) =>
      mc.name
        .replace(/\u3000/g, " ")
        .replace(/^スマスロ\s*/u, "L ")
        .replace(/^スマスロ/u, "L")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [machinesForOpenMaker, normalizedQuery]);

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
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
      >
        ≡
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 p-4">
              <p className="text-sm font-semibold text-neutral-800">機種一覧</p>

              <label className="min-w-0 flex-1">
                <span className="sr-only">機種を検索</span>
                <input
                  value={machineQuery}
                  onChange={(e) => setMachineQuery(e.target.value)}
                  placeholder="機種を検索…"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm font-medium"
              >
                閉じる
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-0">
              <div className="min-w-0 border-r border-neutral-200 p-2">
                <p className="px-2 pb-2 text-xs font-semibold text-neutral-500">
                  メーカー
                </p>
                <div className="max-h-[70vh] space-y-1 overflow-y-auto">
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
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          isActive
                            ? "bg-neutral-100 font-semibold text-neutral-900"
                            : "text-neutral-700"
                        }`}
                      >
                        <span className="block break-words">{mk.name}</span>
                      </button>
                    );
                  })}
                  {makers.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-neutral-600">
                      機種データがありません。
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 p-2">
                <p className="px-2 pb-2 text-xs font-semibold text-neutral-500">機種</p>

                <div className="max-h-[70vh] space-y-1 overflow-y-auto">
                  {filteredMachinesForOpenMaker.map((mc) => {
                    const isSelected =
                      mc.id === selectedMachine &&
                      effectiveOpenMaker === selectedMaker;
                    return (
                      <button
                        key={mc.id}
                        type="button"
                        onClick={() => {
                          router.push(buildToolUrl(effectiveOpenMaker, mc.id));
                          setIsOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          isSelected
                            ? "bg-neutral-100 font-semibold text-neutral-900"
                            : "text-neutral-700"
                        }`}
                      >
                        <span className="block break-words">
                          {displayMachineName(mc.name)}
                        </span>
                      </button>
                    );
                  })}

                  {makers.length > 0 && filteredMachinesForOpenMaker.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-neutral-600">
                      {normalizedQuery ? "検索結果がありません。" : "機種がありません。"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">
                データは content/machines.ts を編集して追加します。
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
