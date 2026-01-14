import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

export function getStripePriceId(): string {
  const v = process.env.STRIPE_PRICE_ID;
  if (!v) throw new Error("Missing STRIPE_PRICE_ID");
  return v;
}
