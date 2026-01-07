import Link from "next/link";
import LatestXCard from "../components/LatestXCard";
import { getRecentPosts } from "../lib/posts";
import { getXConfig } from "../lib/x";

export default async function Home() {
  const recentPosts = await getRecentPosts(2);
  const xConfig = await getXConfig();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="space-y-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">判別ツール</h2>
          <p className="mt-2 text-sm text-neutral-600">
            機種選択はサイドバーから。まずは判別ツールへ。
          </p>

          <Link
            href="/tool"
            className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white"
          >
            <span>判別ツールへ</span>
            <span aria-hidden className="text-xl leading-none">
              →
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">新着情報</h2>
          {recentPosts.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <span className="text-neutral-500">{p.date}：</span>
                  {p.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">
              まだ新着情報がありません。
            </p>
          )}
        </div>

        <LatestXCard profileUrl={xConfig.profileUrl} />
      </section>
    </main>
  );
}
