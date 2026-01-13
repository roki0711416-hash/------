import { machines, type Machine } from "../content/machines";

export type MachineListItem = Pick<Machine, "id" | "name">;

export type Maker = {
  name: string;
  machines: MachineListItem[];
};

export type MachinesData = {
  makers: Maker[];
};

export async function getAllMachines(): Promise<readonly Machine[]> {
  return machines;
}

export async function getMachineById(id: string): Promise<Machine | null> {
  const found = machines.find((m) => m.id === id);
  return found ?? null;
}

export async function getMachinesData(): Promise<MachinesData> {
  const byMaker = new Map<string, MachineListItem[]>();

  for (const m of machines) {
    const list = byMaker.get(m.maker) ?? [];
    list.push({ id: m.id, name: m.name });
    byMaker.set(m.maker, list);
  }

  const pinnedMakers = ["北電子", "パイオニア"] as const;

  function makerGroup(name: string): number {
    const trimmed = name.trim();
    const first = trimmed[0] ?? "";

    // カタカナ/ひらがな
    if (/^[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/u.test(first)) return 0;

    // 漢字（CJK統合漢字 + 拡張A）
    if (/^[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(first)) return 1;

    // ローマ字
    if (/^[A-Za-z]/u.test(first)) return 2;

    return 3;
  }

  const makers: Maker[] = Array.from(byMaker.entries())
    .sort(([a], [b]) => {
      const aIdx = pinnedMakers.indexOf(a as (typeof pinnedMakers)[number]);
      const bIdx = pinnedMakers.indexOf(b as (typeof pinnedMakers)[number]);

      const aPinned = aIdx !== -1;
      const bPinned = bIdx !== -1;
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
