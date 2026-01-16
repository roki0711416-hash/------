import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (!stripe) {
    // APIバージョンはアカウント側の設定に追従（ローカルデモでの互換性を優先）
    stripe = new Stripe(key);
  }

  return stripe;
}
