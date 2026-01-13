import { machines, type Machine } from "../content/machines";

export type MachineListItem = Pick<Machine, "id" | "name">;

export type Maker = {
  name: string;
  machines: MachineListItem[];
};

export type MachinesData = {
  makers: Maker[];
};

function normalizeMachineName(machine: Machine): string {
  const raw = machine.name.trim();
  if (machine.category !== "SMART") return raw;

  // Already normalized (accept both "Lxxxx" and "L xxxx")
  if (/^L(?:\s|\u3000)?/u.test(raw)) return raw;

  // Some entries use leading "スマスロ" or "パチスロ".
  const rest = raw.replace(/^(?:スマスロ|パチスロ)\s*/u, "").trim();
  const first = rest[0] ?? "";
  const needsSpace = /^[A-Za-z0-9]/u.test(first);
  return needsSpace ? `L ${rest}` : `L${rest}`;
}

export async function getAllMachines(): Promise<readonly Machine[]> {
  return machines.map((m) => ({ ...m, name: normalizeMachineName(m) }));
}

export async function getMachineById(id: string): Promise<Machine | null> {
  const found = machines.find((m) => m.id === id);
  if (!found) return null;
  return { ...found, name: normalizeMachineName(found) };
}

export async function getMachinesData(): Promise<MachinesData> {
  const byMaker = new Map<string, MachineListItem[]>();

  for (const m of machines) {
    const list = byMaker.get(m.maker) ?? [];
    list.push({ id: m.id, name: normalizeMachineName(m) });
    byMaker.set(m.maker, list);
  }

  const pinnedMakers = ["北電子", "パイオニア"] as const;
  const pinnedSet = new Set<string>(pinnedMakers);

  function makerGroup(name: string): number {
    const trimmed = name.trim();
    const first = trimmed[0] ?? "";
    if (/^[\u30A0-\u30FF]$/u.test(first)) return 0; // カタカナ
    if (/^[\u4E00-\u9FFF\u3400-\u4DBF\u3005]$/u.test(first)) return 1; // 漢字(々含む)
    if (/^[A-Za-z]$/u.test(first)) return 2; // ローマ字
    return 3;
  }

  const makers: Maker[] = Array.from(byMaker.entries())
    .sort(([a], [b]) => {
      const aIdx = pinnedMakers.indexOf(a as (typeof pinnedMakers)[number]);
      const bIdx = pinnedMakers.indexOf(b as (typeof pinnedMakers)[number]);

      const aPinned = pinnedSet.has(a);
      const bPinned = pinnedSet.has(b);
      if (aPinned && bPinned) return aIdx - bIdx;
      if (aPinned) return -1;
      if (bPinned) return 1;

      const aGroup = makerGroup(a);
      const bGroup = makerGroup(b);
      if (aGroup !== bGroup) return aGroup - bGroup;
      return a.localeCompare(b, "ja");
    })
    .map(([name, ms]) => ({
      name,
      machines: ms.sort((a, b) => a.name.localeCompare(b.name, "ja")),
    }));

  return { makers };
}
