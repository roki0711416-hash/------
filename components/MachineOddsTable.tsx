import type { Machine } from "../content/machines";

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function MachineOddsTable({ machine }: { machine: Machine }) {
  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const regLabel = machine.metricsLabels?.regLabel ?? "REG";
  const totalLabelRaw = machine.metricsLabels?.totalLabel;
  const showTotal = totalLabelRaw !== null;
  const totalLabel = (totalLabelRaw === undefined ? "合算" : totalLabelRaw) ?? "合算";
  const extraLabel = machine.metricsLabels?.extraLabel ?? null;
  const hasExtra = !!extraLabel && machine.odds.settings.some((s) => typeof s.extra === "number");

  const suikaCzRateLabel = machine.metricsLabels?.suikaCzRateLabel ?? "スイカCZ当選率";
  const hasSuikaCzRate = machine.odds.settings.some((s) => typeof s.suikaCzRate === "number");

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
              <th className="px-3 py-2 border border-neutral-200">{bigLabel}</th>
              <th className="px-3 py-2 border border-neutral-200">{regLabel}</th>
              {showTotal ? (
                <th className="px-3 py-2 border border-neutral-200">{totalLabel}</th>
              ) : null}
              {hasExtra ? (
                <th className="px-3 py-2 border border-neutral-200">{extraLabel}</th>
              ) : null}
              {hasSuikaCzRate ? (
                <th className="px-3 py-2 border border-neutral-200">{suikaCzRateLabel}</th>
              ) : null}
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
                {showTotal ? (
                  <td className="px-3 py-2 border border-neutral-200">1/{fmt(row.total)}</td>
                ) : null}
                {hasExtra ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {typeof row.extra === "number" ? `1/${fmt(row.extra)}` : "-"}
                  </td>
                ) : null}
                {hasSuikaCzRate ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {typeof row.suikaCzRate === "number"
                      ? `${(row.suikaCzRate * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                ) : null}
                <td className="px-3 py-2 border border-neutral-200">{fmt(row.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
