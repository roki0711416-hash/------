import type { ReactNode } from "react";

import BackToTop from "@/components/BackToTop";

export default function IosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ios-shell">
      {children}
      <BackToTop />
    </div>
  );
}
