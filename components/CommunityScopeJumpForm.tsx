"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardId } from "../lib/community";

export default function CommunityScopeJumpForm({
  boardId,
  kind,
  machineMakers,
}: {
  boardId: BoardId;
  kind: "hall" | "machine";
  machineMakers?: Array<{ name: string; machines: Array<{ id: string; name: string }> }>;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedMaker, setSelectedMaker] = useState<string>("");
  const [selectedMachine, setSelectedMachine] = useState<string>("");

  const label = useMemo(() => (kind === "hall" ? "ホール名" : "機種名"), [kind]);
  const placeholder = useMemo(
    () => (kind === "hall" ? "例: ○○ホール新宿店" : "例: L北斗の拳"),
    [kind],
  );

  const makerToMachineSet = useMemo(() => {
    if (kind !== "machine" || !machineMakers) return null;
    const map = new Map<string, Set<string>>();
    for (const mk of machineMakers) {
      map.set(mk.name, new Set(mk.machines.map((m) => m.name)));
    }
    return map;
  }, [kind, machineMakers]);

  const machineOptionsForMaker = useMemo(() => {
    if (kind !== "machine" || !machineMakers) return [];
    const mk = machineMakers.find((m) => m.name === selectedMaker);
    return mk?.machines ?? [];
  }, [kind, machineMakers, selectedMaker]);

  function go() {
    if (kind === "machine") {
      const maker = selectedMaker.trim();
      const machine = selectedMachine.trim();
      if (!maker) {
        setError("メーカーを選択してください");
        return;
      }
      if (!machine) {
        setError("機種を選択してください");
        return;
      }
      if (machine.length > 50) return;
      const set = makerToMachineSet?.get(maker);
      if (!set || !set.has(machine)) {
        setError("機種一覧に登録されている機種から選択してください");
        return;
      }
      router.push(`/community/${boardId}/${kind}/${encodeURIComponent(machine)}`);
      return;
    }

    const v = value.trim();
    if (!v) return;
    if (v.length > 50) return;
    router.push(`/community/${boardId}/${kind}/${encodeURIComponent(v)}`);
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold">{label}を選ぶ</p>
      {kind === "machine" && machineMakers ? (
        <div className="mt-3 space-y-2">
          <select
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={selectedMaker}
            onChange={(e) => {
              setSelectedMaker(e.target.value);
              setSelectedMachine("");
              if (error) setError(null);
            }}
          >
            <option value="">メーカーを選ぶ</option>
            {machineMakers.map((mk) => (
              <option key={mk.name} value={mk.name}>
                {mk.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={selectedMachine}
              onChange={(e) => {
                setSelectedMachine(e.target.value);
                if (error) setError(null);
              }}
              disabled={!selectedMaker}
            >
              <option value="">機種を選ぶ</option>
              {machineOptionsForMaker.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={go}
              className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              次へ
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            maxLength={50}
          />
          <button
            type="button"
            onClick={go}
            className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            次へ
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      <p className="mt-2 text-xs text-neutral-500">入力後「次へ」でスレ一覧に移動します。</p>
    </div>
  );
}
