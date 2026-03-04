/**
 * lib/constants.ts
 *
 * アプリ全体で共有する定数。
 * App Store URL など外部リンクをここに集約し、差し替えを容易にする。
 */

/** iOS App Store URL */
export const APPSTORE_URL = "https://apps.apple.com/jp/app/%E3%82%B9%E3%83%AD%E3%82%AB%E3%82%B9%E3%81%8F%E3%82%93%E8%A8%AD%E5%AE%9A%E5%88%A4%E5%88%A5/id6759392094";

export type AppStoreStatus = "review" | "live";
const rawAppStoreStatus = process.env.NEXT_PUBLIC_APP_STORE_STATUS;

/**
 * 審査ステータス（デフォルト: review）
 * - review: 審査中表示（遷移なし）
 * - live: App Storeリンク有効
 */
export const APP_STORE_STATUS: AppStoreStatus = rawAppStoreStatus === "review" ? "review" : "live";
export const IS_APP_UNDER_REVIEW = APP_STORE_STATUS === "review";

/** Web版 店舗分析入口 */
export const WEB_ANALYTICS_URL = "/prefectures";

/** サポート・お問い合わせページ */
export const SUPPORT_URL = "/contact";
