/**
 * GradientBg — 全ページ共通の派手背景。
 * 4つのアンビエントグローオーブ + body の暗グラデを視覚的に補強する。
 * layout.tsx 内に1回配置すればOK。
 */
export default function GradientBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-orange-600/[0.06] blur-[150px]" />
      <div className="absolute right-0 top-[30%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.05] blur-[130px]" />
      <div className="absolute bottom-[30%] left-0 h-[400px] w-[400px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/[0.04] blur-[140px]" />
    </div>
  );
}
