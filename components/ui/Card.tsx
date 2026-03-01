import type { ReactNode } from "react";

/**
 * Card — ダークテーマ統一カード。
 * 半透明ガラスモーフィズム + 発光ボーダー + hover リフト。
 */
export default function Card({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  /** hover 時に浮かすか */
  hover?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300",
        hover
          ? "hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-xl hover:shadow-white/[0.03]"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
