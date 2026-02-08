import { IosCard } from "./IosCard";

export function IosAdBanner() {
  return (
    <IosCard className="bg-zinc-50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-800">広告枠（ダミー）</p>
        <p className="text-xs text-zinc-500">後で差し替え予定</p>
      </div>
    </IosCard>
  );
}
