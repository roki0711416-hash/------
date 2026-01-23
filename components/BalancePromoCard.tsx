import Link from "next/link";

export default function BalancePromoCard() {
  return (
    <section className="mt-4 hidden md:block">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-neutral-900">収支表</h2>
            <p className="mt-1 text-sm text-neutral-700">
              日々の実戦収支を記録・管理できます
            </p>
          </div>

          <Link
            href="/record"
            className="shrink-0 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
          >
            収支表を見る
          </Link>
        </div>
      </div>
    </section>
  );
}
