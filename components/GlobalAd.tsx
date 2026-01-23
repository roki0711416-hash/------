"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  className?: string;
  minHeightPx?: number;
};

const ADSENSE_CLIENT = "ca-pub-6861979311690077";

export default function GlobalAd({ className, minHeightPx = 140 }: Props) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_GLOBAL_SLOT?.trim();
  const insRef = useRef<HTMLModElement | null>(null);
  const [hidden, setHidden] = useState(false);

  const wrapperClassName = useMemo(() => {
    const base = "lg:hidden my-10 max-w-md mx-auto px-2";
    return className ? `${base} ${className}` : base;
  }, [className]);

  useEffect(() => {
    if (!adSlot) return;

    const tryPush = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      } catch {
        // ignore
      }
    };

    // Script load timing can vary; try twice.
    tryPush();
    const retryTimer = window.setTimeout(tryPush, 300);

    const collapseIfUnfilled = () => {
      const el = insRef.current;
      if (!el) return;

      const status = el.getAttribute("data-ad-status");
      const hasIframe = !!el.querySelector("iframe");

      // If AdSense explicitly says unfilled, or it never filled, hide to avoid blank space.
      if (status === "unfilled" || (status !== "filled" && !hasIframe)) {
        setHidden(true);
      }
    };

    const earlyCheckTimer = window.setTimeout(() => {
      const el = insRef.current;
      if (!el) return;
      const status = el.getAttribute("data-ad-status");
      if (status === "unfilled") setHidden(true);
    }, 2500);

    const finalCheckTimer = window.setTimeout(collapseIfUnfilled, 7000);

    return () => {
      window.clearTimeout(retryTimer);
      window.clearTimeout(earlyCheckTimer);
      window.clearTimeout(finalCheckTimer);
    };
  }, [adSlot]);

  if (!adSlot || hidden) return null;

  return (
    <div className={wrapperClassName}>
      <div style={{ minHeight: `${minHeightPx}px` }}>
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
