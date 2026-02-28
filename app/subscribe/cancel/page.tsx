import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SubscribeCancelPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <h1 className="text-lg font-semibold">決済</h1>

        <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
          <p className="text-sm font-semibold text-white">決済を中断しました</p>
          <p className="mt-1 text-sm text-muted">またいつでも登録できます。</p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/subscribe"
            className="flex-1 rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-5 py-3 text-center text-sm font-semibold text-white"
          >
            サブスク登録へ
          </Link>
          <Link
            href="/account"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white"
          >
            アカウント
          </Link>
        </div>
      </section>
    </main>
  );
}
