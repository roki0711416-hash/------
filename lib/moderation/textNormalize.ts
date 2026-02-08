export function normalizeModerationText(input: string): string {
  // 1) 全角英数(ほぼASCII)→半角
  //    U+FF01(！) - U+FF5E(～) は ASCII の U+0021 - U+007E に対応
  //    変換後に英字を小文字化する
  const halfWidth = input
    .replace(/\u3000/g, " ")
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

  const lower = halfWidth.toLowerCase();

  // 2) 空白（全角/半角）と改行を除去
  const noSpace = lower.replace(/[\s\u3000]+/g, "");

  // 3) 記号を除去（すり抜け対策）
  //    Unicode property escapes が使える環境前提（Next.js/Node.js）
  const noPunct = noSpace.replace(/[\p{P}\p{S}]+/gu, "");

  return noPunct;
}
