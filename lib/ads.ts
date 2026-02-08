/**
 * Ads (AdSense/AdMob) kill-switch.
 *
 * Default: disabled.
 * Only enable after AdSense approval.
 */
export const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
