/**
 * lib/constants.ts
 *
 * アプリ全体で共有する定数。
 * App Store URL など外部リンクをここに集約し、差し替えを容易にする。
 */

/** iOS App Store URL（審査通過後に差し替え） */
export const APPSTORE_URL = "https://apps.apple.com/app/id0000000000";

export type AppStoreStatus = "review" | "live";
const rawAppStoreStatus = process.env.NEXT_PUBLIC_APP_STORE_STATUS;

/**
 * 審査ステータス（デフォルト: review）
 * - review: 審査中表示（遷移なし）
 * - live: App Storeリンク有効
 */
export const APP_STORE_STATUS: AppStoreStatus = rawAppStoreStatus === "live" ? "live" : "review";
export const IS_APP_UNDER_REVIEW = APP_STORE_STATUS === "review";

/** Web版 店舗分析入口 */
export const WEB_ANALYTICS_URL = "/prefectures";

/** サポート・お問い合わせページ */
export const SUPPORT_URL = "/contact";
