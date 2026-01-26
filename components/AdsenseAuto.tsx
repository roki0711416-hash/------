"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdsenseAuto() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // no-op
    }
  }, []);

  return (
    <div className="mt-6">
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6861979311690077"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
