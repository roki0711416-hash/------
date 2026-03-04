import type { Metadata } from "next";
import Hero from "@/components/lp/Hero";
import Features from "@/components/lp/Features";
import HowItWorks from "@/components/lp/HowItWorks";
import BottomCTA from "@/components/lp/BottomCTA";
import LpStoreAnalyticsTeaser from "@/components/lp/StoreAnalyticsTeaser";
import FAQ from "@/components/lp/FAQ";
import StickyCTA from "@/components/lp/StickyCTA";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

export const metadata: Metadata = {
  title: "スロカスくん｜パチスロ設定判別アプリ（iOS）",
  description:
    "スロカスくんは、パチスロの設定判別・店舗分析・収支管理をサポートする無料iOSアプリです。App Storeから今すぐ入手。",
  alternates: { canonical: `${BASE_URL}/` },
};

export default function Home() {
  return (
    <>
      <div className="relative w-[100vw] ml-[calc(-50vw+50%)] overflow-hidden bg-gradient-to-b from-bg0 via-bg1 to-bg0">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-orange-600/[0.07] blur-[150px]" />
        <div className="pointer-events-none absolute right-0 top-[30%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.06] blur-[130px]" />
        <div className="pointer-events-none absolute bottom-[30%] left-0 h-[400px] w-[400px] rounded-full bg-indigo-600/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[140px]" />

        <Hero />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <Features />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <HowItWorks />

        <BottomCTA />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <LpStoreAnalyticsTeaser />

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <FAQ />
      </div>

      <StickyCTA />
    </>
  );
}
