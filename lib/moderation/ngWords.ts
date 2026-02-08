import { normalizeModerationText } from "./textNormalize";

// 必要に応じて追加してください（ここは簡易の初期実装）
export const NG_WORDS = [
  // 例: "spammer",
] as const;

const NORMALIZED_NG_WORDS = NG_WORDS.map((w) => normalizeModerationText(w)).filter(Boolean);

export function hasNgWord(text: string): boolean {
  if (!text) return false;
  if (NORMALIZED_NG_WORDS.length === 0) return false;

  const normalized = normalizeModerationText(text);
  if (!normalized) return false;

  return NORMALIZED_NG_WORDS.some((w) => normalized.includes(w));
}
