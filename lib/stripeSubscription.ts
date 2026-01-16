import type Stripe from "stripe";
import { getDb } from "./db";

function unixToIsoOrNull(sec: number | null | undefined) {
  if (!sec || !Number.isFinite(sec)) return null;
  return new Date(sec * 1000).toISOString();
}

export async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const db = getDb();
  if (!db) return;

  const anySub = sub as unknown as {
    id: string;
    status: string;
    current_period_end?: number | null;
    trial_end?: number | null;
    cancel_at_period_end?: boolean | null;
  };

  const stripeSubscriptionId = anySub.id;
  const status = anySub.status;
  const currentPeriodEnd = unixToIsoOrNull(anySub.current_period_end ?? null);
  const trialEnd = unixToIsoOrNull(anySub.trial_end ?? null);
  const cancelAtPeriodEnd = anySub.cancel_at_period_end ?? null;

  await db.sql`
    INSERT INTO subscriptions (
      user_id,
      stripe_subscription_id,
      status,
      current_period_end,
      trial_end,
      cancel_at_period_end,
      updated_at
    )
    VALUES (
      ${userId},
      ${stripeSubscriptionId},
      ${status},
      ${currentPeriodEnd},
      ${trialEnd},
      ${cancelAtPeriodEnd},
      now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      trial_end = EXCLUDED.trial_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = now()
  `;
}
