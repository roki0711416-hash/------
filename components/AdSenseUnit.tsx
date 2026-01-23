"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  adSlot: string;
  className?: string;
  /** Placeholder height to reduce layout shift before the ad fills. */
  minHeightPx?: number;
};

const ADSENSE_CLIENT = "ca-pub-6861979311690077";

export default function AdSenseUnit({
  adSlot,
  className,
  minHeightPx = 140,
}: Props) {
  const insRef = useRef<HTMLModElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const wrapperClassName = useMemo(() => {
    const base = "lg:hidden my-8 max-w-md mx-auto px-2";
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

    // 1) attempt immediately
    tryPush();

    // 2) if the script is a bit late, try once more shortly after
    const retryTimer = window.setTimeout(tryPush, 300);

    const checkFilled = () => {
      const el = insRef.current;
      if (!el) return;

      const status = el.getAttribute("data-ad-status");
      const hasIframe = !!el.querySelector("iframe");

      // If AdSense explicitly marks it as unfilled, collapse.
      if (status === "unfilled") {
        setCollapsed(true);
        return;
      }

      // If it's still not filled after a while, collapse to avoid leaving blank space.
      if (status !== "filled" && !hasIframe) {
        setCollapsed(true);
      }
    };

    // Early check: only collapse when AdSense explicitly says "unfilled".
    const earlyCheckTimer = window.setTimeout(() => {
      const el = insRef.current;
      if (!el) return;
      const status = el.getAttribute("data-ad-status");
      if (status === "unfilled") setCollapsed(true);
    }, 2500);

    // Final check: collapse if still empty.
    const finalCheckTimer = window.setTimeout(checkFilled, 7000);

    return () => {
      window.clearTimeout(retryTimer);
      window.clearTimeout(earlyCheckTimer);
      window.clearTimeout(finalCheckTimer);
    };
  }, [adSlot]);

  if (!adSlot || collapsed) return null;

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
