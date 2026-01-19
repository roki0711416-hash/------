import type { Machine } from "../content/machines";

function fmt(n: number | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function MachineOddsTable({ machine }: { machine: Machine }) {
  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const regLabelRaw = machine.metricsLabels?.regLabel;
  const showReg = regLabelRaw !== null;
  const regLabel = regLabelRaw ?? "REG";
  const totalLabelRaw = machine.metricsLabels?.totalLabel;
  const showTotal = totalLabelRaw !== null;
  const totalLabel = (totalLabelRaw === undefined ? "合算" : totalLabelRaw) ?? "合算";
  const extraLabel = machine.metricsLabels?.extraLabel ?? null;
  const hasExtra = !!extraLabel && machine.odds.settings.some((s) => typeof s.extra === "number");

  const suikaCzRateLabel = machine.metricsLabels?.suikaCzRateLabel ?? "スイカCZ当選率";
  const hasSuikaCzRate = machine.odds.settings.some((s) => typeof s.suikaCzRate === "number");

  const extraMetrics = machine.metricsLabels?.extraMetrics ?? [];
  const extraMetricsToShow = extraMetrics.filter((em) =>
    machine.odds.settings.some((s) => typeof s.extras?.[em.id] === "number"),
  );

  const binomialMetrics = machine.metricsLabels?.binomialMetrics ?? [];
  const binomialMetricsToShow = binomialMetrics.filter((bm) =>
    machine.odds.settings.some((s) => typeof s.binomialRates?.[bm.id] === "number"),
  );

  const countRows: Array<{
    key: string;
    label: string;
    denomBySetting: (s: (typeof machine.odds.settings)[number]) => number | null;
  }> = [
    ...extraMetricsToShow.map((em) => ({
      key: `extra:${em.id}`,
      label: em.label,
      denomBySetting: (s: (typeof machine.odds.settings)[number]) => {
        const denom = s.extras?.[em.id];
        return typeof denom === "number" && Number.isFinite(denom) && denom > 0 ? denom : null;
      },
    })),
    ...binomialMetricsToShow.map((bm) => ({
      key: `binomial:${bm.id}`,
      label: bm.rateLabel ?? bm.id,
      denomBySetting: (s: (typeof machine.odds.settings)[number]) => {
        const p = s.binomialRates?.[bm.id];
        return typeof p === "number" && Number.isFinite(p) && p > 0 ? 1 / p : null;
      },
    })),
  ];
  const hasCountOdds = countRows.length > 0;

  return (
    <>
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
                {showReg ? (
                  <th className="px-3 py-2 border border-neutral-200">{regLabel}</th>
                ) : null}
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
                  {showReg ? (
                    <td className="px-3 py-2 border border-neutral-200">1/{fmt(row.reg)}</td>
                  ) : null}
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

      {hasCountOdds ? (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">カウント系確率</h2>
          <p className="mt-1 text-sm text-neutral-600">設定別の 1/○○ 表記</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="sticky left-0 z-10 bg-white px-3 py-2 border border-neutral-200">
                    項目
                  </th>
                  {machine.odds.settings.map((s, idx) => (
                    <th key={`${s.s}-${idx}`} className="px-3 py-2 border border-neutral-200">
                      設定{s.s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countRows.map((row) => (
                  <tr key={row.key} className="text-neutral-800">
                    <td className="sticky left-0 bg-white px-3 py-2 font-semibold border border-neutral-200">
                      {row.label}
                    </td>
                    {machine.odds.settings.map((s, idx) => {
                      const denom = row.denomBySetting(s);
                      return (
                        <td key={`${row.key}-${s.s}-${idx}`} className="px-3 py-2 border border-neutral-200">
                          {typeof denom === "number" ? `1/${fmt(denom)}` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}
