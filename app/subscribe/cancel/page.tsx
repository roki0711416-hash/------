import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SubscribeCancelPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">決済</h1>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-800">決済を中断しました</p>
          <p className="mt-1 text-sm text-neutral-700">またいつでも登録できます。</p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/subscribe"
            className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
          >
            サブスク登録へ
          </Link>
          <Link
            href="/account"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-900"
          >
            アカウント
          </Link>
        </div>
      </section>
    </main>
  );
}
