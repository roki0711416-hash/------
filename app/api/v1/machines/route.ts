import { NextResponse } from "next/server";
import { getAllMachines } from "@/lib/machines";

export async function GET() {
  const all = await getAllMachines();
  const list = all.map(({ id, name, maker, series, category, image }) => ({
    id,
    name,
    maker,
    series: series ?? "",
    category,
    image: image ?? null,
  }));
  return NextResponse.json(list);
}
