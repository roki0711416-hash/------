"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type MachineListItem = {
  id: string;
  name: string;
};

type Maker = {
  name: string;
  machines: MachineListItem[];
};

type MachineWithMaker = MachineListItem & {
  makerName: string;
};

type Props = {
  makers: Maker[];
  initialQuery?: string;
};

const machineNameCollator = new Intl.Collator("ja", {
  usage: "sort",
  sensitivity: "base",
  numeric: true,
});

function normalizeMachineNameForKanaSort(name: string): string {
  return name
    .replace(/\u3000/g, " ")
    .trim()
    .replace(/^(?:スマスロ|パチスロ)\s*/u, "")
    .replace(/^(?:S|L|P)(?:\s|\u3000)?/u, "")
    .trim();
}

function compareMachineNamesJa(a: string, b: string): number {
  const aKey = normalizeMachineNameForKanaSort(a);
  const bKey = normalizeMachineNameForKanaSort(b);
  const primary = machineNameCollator.compare(aKey, bKey);
  if (primary !== 0) return primary;
  return machineNameCollator.compare(a, b);
}

function normalizeQuery(input: string): string {
  return input.replace(/\u3000/g, " ").trim().toLowerCase();
}

function normalizeMachineNameForSearch(name: string): string {
  return name
    .replace(/\u3000/g, " ")
    .replace(/^スマスロ\s*/u, "L ")
    .replace(/^スマスロ/u, "L")
    .toLowerCase();
}

export default function MachinesSearchList({ makers, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  const allMachines: MachineWithMaker[] = useMemo(() => {
    return makers.flatMap((mk) => mk.machines.map((mc) => ({ ...mc, makerName: mk.name })));
  }, [makers]);

  const filteredMachines = useMemo(() => {
    if (!normalizedQuery) return [];
    return allMachines
      .filter((mc) => normalizeMachineNameForSearch(mc.name).includes(normalizedQuery))
      .sort((a, b) => compareMachineNamesJa(a.name, b.name));
  }, [allMachines, normalizedQuery]);

  return (
    <>
      <label className="block">
        <span className="sr-only">機種を検索</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="全機種を検索…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
        />
      </label>

      {normalizedQuery ? (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-800">検索結果</h3>

          <ul className="mt-3 grid gap-2">
            {filteredMachines.map((mc) => {
              const sp = new URLSearchParams();
              sp.set("maker", mc.makerName);
              sp.set("machine", mc.id);
              return (
                <li key={`${mc.makerName}:${mc.id}`}>
                  <Link
                    href={`/judge?${sp.toString()}`}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900"
                  >
                    <span className="min-w-0 flex-1 break-words">{mc.name}</span>
                    <span className="ml-3 shrink-0 text-xs text-neutral-500">{mc.makerName}</span>
                    <span aria-hidden className="ml-3 text-base leading-none text-neutral-700">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}

            {filteredMachines.length === 0 ? (
              <li className="text-sm text-neutral-600">検索結果がありません。</li>
            ) : null}
          </ul>
        </section>
      ) : (
        <div className="mt-4 space-y-3">
          {makers.map((mk) => (
            <details
              key={mk.name}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-800">{mk.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{mk.machines.length}</span>
                  <span aria-hidden className="text-base leading-none text-neutral-600">
                    ▾
                  </span>
                </div>
              </summary>

              <ul className="mt-3 grid gap-2">
                {[...mk.machines].sort((a, b) => compareMachineNamesJa(a.name, b.name)).map((mc) => {
                  const sp = new URLSearchParams();
                  sp.set("maker", mk.name);
                  sp.set("machine", mc.id);
                  return (
                    <li key={mc.id}>
                      <Link
                        href={`/judge?${sp.toString()}`}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900"
                      >
                        <span className="min-w-0 flex-1 break-words">{mc.name}</span>
                        <span aria-hidden className="ml-3 text-base leading-none text-neutral-700">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}

          {makers.length === 0 ? (
            <p className="text-sm text-neutral-600">機種データがありません。</p>
          ) : null}
        </div>
      )}
    </>
  );
}
