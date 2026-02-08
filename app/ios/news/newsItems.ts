export type IosNewsItem = {
  date: string;
  body: string;
  machineName: string;
  machineId: string;
};

// 追記していくだけで新着情報に反映されます
export const newsItems: IosNewsItem[] = [
  {
    date: "2026-02-06",
    body: "機種データを追加しました。設定判別でお試しください。",
    machineName: "（例）L北斗の拳",
    machineId: "hokuto",
  },
];
