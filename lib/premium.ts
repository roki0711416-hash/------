import { getDb } from "./db";
import { getCurrentUserFromCookies } from "./auth";
import { isAdminRole, shouldBeAdminFromEnv } from "./roles";

export type SubscriptionRow = {
  user_id: string;
  stripe_subscription_id: string | null;
  status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean | null;
  updated_at: string;
};

export function isPremiumStatus(status: string | null) {
  return status === "active" || status === "trialing";
}

export function isPremiumForUserAndSubscription(
  user: { id: string; email: string; role?: string | null } | null,
  sub: { status: string | null } | null,
) {
  if (!user) return false;
  if (isAdminRole(user.role) || shouldBeAdminFromEnv({ userId: user.id, email: user.email })) {
    return true;
  }
  return isPremiumStatus(sub?.status ?? null);
}

export function hasAnyActiveishSubscription(sub: SubscriptionRow | null) {
  return (
    isPremiumStatus(sub?.status ?? null) ||
    (Boolean(sub?.stripe_subscription_id) &&
      sub?.status !== "canceled" &&
      sub?.status !== "incomplete_expired")
  );
}

export async function getSubscriptionForUserId(userId: string) {
  const db = getDb();
  if (!db) return null;

  const { rows } = await db.sql`
    SELECT user_id, stripe_subscription_id, status, current_period_end, trial_end, cancel_at_period_end, updated_at
    FROM subscriptions
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return (rows[0] as SubscriptionRow | undefined) ?? null;
}

export async function getIsPremiumFromCookies() {
  const user = await getCurrentUserFromCookies();
  if (!user) return false;

  if (isAdminRole(user.role) || shouldBeAdminFromEnv({ userId: user.id, email: user.email })) {
    return true;
  }

  const sub = await getSubscriptionForUserId(user.id);
  return isPremiumStatus(sub?.status ?? null);
}
