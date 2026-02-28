"use client";

import Reveal from "./Reveal";

const STEPS = [
  {
    step: 1,
    title: "機種を選ぶ",
    body: "一覧や検索から打っている台を選択します。",
  },
  {
    step: 2,
    title: "データを入力",
    body: "総ゲーム数やボーナス回数など実戦データを入力します。",
  },
  {
    step: 3,
    title: "結果を確認",
    body: "設定ごとの確率が一目で分かり、判断をサポートします。",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            使い方はかんたん
          </h2>
          <p className="mt-4 text-center text-base text-neutral-400">
            3ステップで設定判別。
          </p>
        </Reveal>

        <div className="relative mt-12">
          {/* Connecting line (PC only) */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-orange-500/50 via-pink-500/50 to-violet-500/50 sm:block" />

          <ol className="space-y-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 150}>
                <li className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:pl-16">
                  {/* Number badge */}
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-base font-black text-white shadow-lg shadow-orange-500/25 sm:absolute sm:left-1">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                      {s.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
