import type { Metadata } from "next";
import Hero from "@/components/lp/Hero";
import Features from "@/components/lp/Features";
import PreviewStrip from "@/components/lp/PreviewStrip";
import HowItWorks from "@/components/lp/HowItWorks";
import BottomCTA from "@/components/lp/BottomCTA";
import LpStoreAnalyticsTeaser from "@/components/lp/StoreAnalyticsTeaser";
import FAQ from "@/components/lp/FAQ";
import LpFooter from "@/components/lp/Footer";
import StickyCTA from "@/components/lp/StickyCTA";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

export const metadata: Metadata = {
  title: "スロカスくん｜パチスロ設定判別アプリ（iOS）",
  description:
    "スロカスくんは、パチスロの設定判別・店舗分析・収支管理をサポートする無料iOSアプリです。App Storeから今すぐ入手。",
  alternates: { canonical: `${BASE_URL}/lp` },
};

/* ================================================================== */
/*  LP 本体                                                            */
/* ================================================================== */

export default function LandingPage() {
  return (
    <>
      {/* ダーク系全幅コンテナ：レイアウトの制約を突き抜けてフルブリード */}
      <div className="relative w-[100vw] ml-[calc(-50vw+50%)] overflow-hidden bg-gradient-to-b from-slate-950 via-[#0c0e2b] to-slate-950">
        {/* ──── Ambient glow orbs ──── */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-orange-600/[0.07] blur-[150px]" />
        <div className="pointer-events-none absolute right-0 top-[30%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.06] blur-[130px]" />
        <div className="pointer-events-none absolute bottom-[30%] left-0 h-[400px] w-[400px] rounded-full bg-indigo-600/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[140px]" />

        {/* (1) Hero — フルスクリーン級 */}
        <Hero />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* (2) Features — 4カード */}
        <Features />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* (3) Preview — 横スクロール */}
        <PreviewStrip />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* (4) How it works — 3ステップ */}
        <HowItWorks />

        {/* (5) CTA（中間） */}
        <BottomCTA />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* (6) Store Analytics — /prefectures入口 */}
        <LpStoreAnalyticsTeaser />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* (7) FAQ */}
        <FAQ />

        {/* (8) Footer（免責＋リンク） */}
        <LpFooter />
      </div>

      {/* モバイル固定CTA */}
      <StickyCTA />
    </>
  );
}
