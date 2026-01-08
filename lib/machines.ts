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

  const makerOrder = ["北電子", "パイオニア", "サミー", "ユニバーサル"] as const;

  const makers: Maker[] = Array.from(byMaker.entries())
    .sort(([a], [b]) => {
      const aIdx = makerOrder.indexOf(a as (typeof makerOrder)[number]);
      const bIdx = makerOrder.indexOf(b as (typeof makerOrder)[number]);

      const aHas = aIdx !== -1;
      const bHas = bIdx !== -1;
      if (aHas && bHas) return aIdx - bIdx;
      if (aHas) return -1;
      if (bHas) return 1;
      return a.localeCompare(b);
    })
    .map(([name, ms]) => ({
      name,
      machines: ms.sort((a, b) => a.name.localeCompare(b.name)),
    }));

  return { makers };
}
