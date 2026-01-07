import type { Machine } from "../content/machines";

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function MachineOddsTable({ machine }: { machine: Machine }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">確率・機械割</h2>
      <p className="mt-1 text-sm text-neutral-600">
        {machine.name}
        {machine.maker ? `（${machine.maker}）` : ""}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 border border-neutral-200">
                設定
              </th>
              <th className="px-3 py-2 border border-neutral-200">BIG</th>
              <th className="px-3 py-2 border border-neutral-200">REG</th>
              <th className="px-3 py-2 border border-neutral-200">合算</th>
              <th className="px-3 py-2 border border-neutral-200">機械割(%)</th>
            </tr>
          </thead>
          <tbody>
            {machine.odds.settings.map((row, idx) => (
              <tr key={`${row.s}-${idx}`} className="text-neutral-800">
                <td className="sticky left-0 bg-white px-3 py-2 font-semibold border border-neutral-200">
                  {row.s}
                </td>
                <td className="px-3 py-2 border border-neutral-200">1/{fmt(row.big)}</td>
                <td className="px-3 py-2 border border-neutral-200">1/{fmt(row.reg)}</td>
                <td className="px-3 py-2 border border-neutral-200">1/{fmt(row.total)}</td>
                <td className="px-3 py-2 border border-neutral-200">{fmt(row.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
