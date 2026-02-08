import { IosCard } from "../_components/IosCard";
import BackLink from "@/components/BackLink";
import Link from "next/link";
import { newsItems } from "./newsItems";

export const dynamic = "force-static";

export default function IosNewsPage() {
  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">新着情報</h1>
          <BackLink />
          <p className="mt-1 text-sm text-zinc-600">アプリの更新・お知らせを確認できます。</p>
        </div>

        <div className="space-y-3">
          {newsItems.length === 0 ? (
            <IosCard>
              <p className="text-sm text-zinc-700">現在、新着情報はありません。</p>
            </IosCard>
          ) : (
            newsItems.map((item) => (
              <IosCard key={`${item.date}:${item.machineId}`}> 
                <p className="text-xs font-semibold text-zinc-600">{item.date}</p>
                <p className="mt-2 text-sm text-zinc-800">{item.body}</p>
                <p className="mt-2 text-sm">
                  <Link
                    href={`/ios/judge?machine=${encodeURIComponent(item.machineId)}`}
                    className="font-semibold text-orange-600 underline"
                  >
                    {item.machineName}
                  </Link>
                </p>
              </IosCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
