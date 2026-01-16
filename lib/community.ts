export const BOARDS = [
  { id: "region", label: "地域別（都道府県）" },
  { id: "hall", label: "ホール別" },
  { id: "machine", label: "機種別" },
  { id: "chat", label: "雑談" },
  { id: "report", label: "実践報告" },
  { id: "beginner", label: "初心者質問" },
] as const;

export const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

export type BoardId = (typeof BOARDS)[number]["id"];

export function isBoardId(v: unknown): v is BoardId {
  return typeof v === "string" && (BOARDS as readonly { id: string }[]).some((b) => b.id === v);
}

export function boardLabel(id: BoardId) {
  return BOARDS.find((b) => b.id === id)?.label ?? id;
}

export function needsPrefecture(boardId: BoardId) {
  return boardId === "region";
}

export function needsHall(boardId: BoardId) {
  return boardId === "hall";
}

export function needsMachine(boardId: BoardId) {
  return boardId === "machine";
}
