"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const FAQ_ITEMS = [
  {
    q: "無料で使えますか？",
    a: "基本的な設定判別と店舗分析（Web）は無料です。一部機能は今後順次拡充予定です。",
  },
  {
    q: "設定判別の結果は正確ですか？",
    a: "公表スペックに基づく統計的な確率計算で設定傾向を示すものであり、結果を保証するものではありません。参考情報としてご活用ください。",
  },
  {
    q: "対応機種はどのくらいありますか？",
    a: "ジャグラー・ハナハナなどのAタイプからスマスロ・AT機まで幅広く対応。機種は順次追加しています。",
  },
  {
    q: "入力したデータはどう扱われますか？",
    a: "端末上で処理され、第三者に共有されることはありません。詳しくはプライバシーポリシーをご確認ください。",
  },
  {
    q: "店舗データはどこから取得していますか？",
    a: "公開されている出玉情報等を基にした独自集計です。データの正確性や最新性を保証するものではありません。",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white sm:text-base">
          Q. {q}
        </span>
        <span
          className={`shrink-0 text-xl leading-none text-neutral-500 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {/* Animated content panel */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-400">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            よくある質問
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={item.q} delay={i * 80}>
              <AccordionItem q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
