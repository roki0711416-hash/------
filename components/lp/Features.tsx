"use client";

import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: "🎰",
    title: "設定判別",
    body: "BIG / REG / 合算確率などを入力するだけで、設定ごとの傾向を見える化。ジャグラー・ハナハナ・AT機に対応。",
    accent: "from-orange-500 to-amber-500",
    border: "border-orange-500/20",
    glow: "hover:shadow-orange-500/10",
  },
  {
    icon: "🏢",
    title: "店舗分析（Web）",
    body: "47都道府県のホール出玉データを集計。地域・店舗ごとの傾向を無料でチェックできます。",
    accent: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/20",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    icon: "📊",
    title: "収支管理",
    body: "日々の実戦結果をかんたんに記録。データを振り返って立ち回りの改善に活かせます。",
    accent: "from-violet-500 to-purple-500",
    border: "border-violet-500/20",
    glow: "hover:shadow-violet-500/10",
  },
  {
    icon: "📖",
    title: "使い方ガイド",
    body: "迷わない入力UIと丁寧なガイド付き。初めてでもすぐに使い始められます。",
    accent: "from-sky-500 to-blue-500",
    border: "border-sky-500/20",
    glow: "hover:shadow-sky-500/10",
  },
];

export default function Features() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            主な機能
          </h2>
          <p className="mt-4 text-center text-base text-white/50">
            設定判別から収支管理まで、これひとつで。
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div
                className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-2xl ${f.glow}`}
              >
                {/* Top gradient line */}
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${f.accent} opacity-60`}
                />
                <p className="text-3xl">{f.icon}</p>
                <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
