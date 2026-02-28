"use client";

import Reveal from "./Reveal";

const SCREENS = [
  {
    title: "機種選択",
    desc: "一覧から機種を選んでタップ",
    emoji: "📱",
    color: "from-orange-500/20 to-orange-600/5",
  },
  {
    title: "データ入力",
    desc: "総ゲーム数やボーナスを入力",
    emoji: "⌨️",
    color: "from-pink-500/20 to-pink-600/5",
  },
  {
    title: "判別結果",
    desc: "設定ごとの確率が一目で分かる",
    emoji: "📊",
    color: "from-violet-500/20 to-violet-600/5",
  },
  {
    title: "店舗分析",
    desc: "地域の出玉傾向をチェック",
    emoji: "🏢",
    color: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    title: "収支グラフ",
    desc: "日々の実戦結果を可視化",
    emoji: "📈",
    color: "from-sky-500/20 to-sky-600/5",
  },
];

export default function PreviewStrip() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            画面プレビュー
          </h2>
          <p className="mt-4 text-center text-base text-neutral-400">
            シンプルな操作で、すぐに使いこなせます。
          </p>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-12 overflow-x-auto px-5 pb-4 scrollbar-none sm:px-8">
          <div className="mx-auto flex w-max gap-4">
            {SCREENS.map((s) => (
              <div key={s.title} className="w-[220px] flex-shrink-0 sm:w-[260px]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                  {/* Screen placeholder */}
                  <div
                    className={`flex h-[320px] items-center justify-center bg-gradient-to-b ${s.color} sm:h-[380px]`}
                  >
                    <div className="text-center">
                      <p className="text-5xl opacity-40">{s.emoji}</p>
                      <p className="mt-4 text-xs font-semibold text-white/30">
                        スクリーンショット
                        <br />
                        準備中
                      </p>
                    </div>
                  </div>
                  {/* Label */}
                  <div className="p-4">
                    <p className="text-sm font-bold text-white">{s.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
