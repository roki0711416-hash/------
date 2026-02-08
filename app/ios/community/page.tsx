import Link from "next/link";
import { IosCard } from "../_components/IosCard";
import { BOARDS } from "@/lib/community";

export const dynamic = "force-static";

export default function IosCommunityIndexPage() {
  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">コミュニティ</h1>
            <p className="mt-1 text-sm text-zinc-600">板を選んでスレ一覧を見られます。</p>
          </div>
          <Link
            href="/ios"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
          >
            ← 戻る
          </Link>
        </div>

        <IosCard>
          <h2 className="text-base font-semibold text-zinc-900">板一覧</h2>

          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="divide-y divide-zinc-200">
              {BOARDS.filter((b) => b.id !== "hall").map((b) => (
                <Link
                  key={b.id}
                  href={`/ios/community/${b.id}`}
                  className="flex w-full items-center justify-between gap-3 bg-white px-4 py-4 text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold tracking-tight">{b.label}</div>
                      {b.hasNew ? (
                        <span className="rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                          NEW
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span aria-hidden className="shrink-0 text-base font-semibold text-zinc-400">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </IosCard>
      </div>
    </div>
  );
}
