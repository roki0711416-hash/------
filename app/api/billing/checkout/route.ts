import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireCurrentUserOrJsonError } from "../../../../lib/auth";
import { getStripe } from "../../../../lib/stripe";
import { getBaseUrl } from "../../../../lib/baseUrl";
import { getSubscriptionForUserId, isPremiumStatus } from "../../../../lib/premium";

export const runtime = "nodejs";

type Plan = "monthly" | "yearly";

function isPlan(v: unknown): v is Plan {
  return v === "monthly" || v === "yearly";
}

async function readPlanFromBodyOrDefault(req: Request): Promise<Plan> {
  try {
    const json = (await req.json()) as unknown;
    if (typeof json === "object" && json !== null) {
      const plan = (json as Record<string, unknown>).plan;
      if (isPlan(plan)) return plan;
    }
  } catch {
    // ignore (no body / invalid json)
  }
  return "monthly";
}

function getPriceIdForPlan(plan: Plan) {
  if (plan === "yearly") return process.env.STRIPE_PRICE_ID_YEARLY;

  // Backward compatible: STRIPE_PRICE_ID is treated as monthly.
  return process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.STRIPE_PRICE_ID;
}

function asStripeLikeError(err: unknown): {
  type?: string;
  code?: string;
  statusCode?: number;
  message?: string;
} {
  if (!err || typeof err !== "object") return {};
  const rec = err as Record<string, unknown>;
  return {
    type: typeof rec.type === "string" ? rec.type : undefined,
    code: typeof rec.code === "string" ? rec.code : undefined,
    statusCode: typeof rec.statusCode === "number" ? rec.statusCode : undefined,
    message: typeof rec.message === "string" ? rec.message : undefined,
  };
}

function toStripeConfigErrorMessage(e: ReturnType<typeof asStripeLikeError>) {
  const hint =
    "Stripeの認証に失敗しました。STRIPE_SECRET_KEY を省略せずに設定してください（sk_test_... / sk_live_...）。";

  if (e.type === "StripeAuthenticationError" || e.statusCode === 401) return hint;
  return "Stripeリクエストに失敗しました。環境変数（STRIPE_SECRET_KEY / Price ID）を確認してください。";
}

export async function POST(req: Request) {
  const auth = await requireCurrentUserOrJsonError();
  if (!auth.ok) return auth.response;

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が未設定です" },
      { status: 503 },
    );
  }

  const plan = await readPlanFromBodyOrDefault(req);
  const priceId = getPriceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          plan === "yearly"
            ? "STRIPE_PRICE_ID_YEARLY が未設定です"
            : "STRIPE_PRICE_ID_MONTHLY（または STRIPE_PRICE_ID）が未設定です",
      },
      { status: 503 },
    );
  }

  const baseUrl = getBaseUrl();

  let customerId = auth.user.stripeCustomerId;

  try {
    // Double-charge prevention: if a subscription already exists for this user,
    // send them to Stripe Billing Portal instead of creating another subscription.
    const existingSub = await getSubscriptionForUserId(auth.user.id);
    const hasAnyActiveishSub =
      isPremiumStatus(existingSub?.status ?? null) ||
      (Boolean(existingSub?.stripe_subscription_id) &&
        existingSub?.status !== "canceled" &&
        existingSub?.status !== "incomplete_expired");

    if (hasAnyActiveishSub) {
      if (!customerId) {
        return NextResponse.json(
          { error: "既存のサブスクがありますが、Stripe customer が未作成です" },
          { status: 409 },
        );
      }

      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/account`,
      });

      return NextResponse.json({ url: portal.url });
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email,
        metadata: { userId: auth.user.id },
      });
      customerId = customer.id;

      await db.sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${auth.user.id};`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: auth.user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      // Trial期間でもカード登録必須
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: auth.user.id },
      },
      // Include session_id as a fallback sync trigger when webhook isn't available.
      success_url: `${baseUrl}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/account?checkout=cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const e = asStripeLikeError(err);
    return NextResponse.json(
      {
        error: toStripeConfigErrorMessage(e),
        ...(process.env.NODE_ENV !== "production"
          ? { debug: { type: e.type, code: e.code, statusCode: e.statusCode } }
          : null),
      },
      { status: 503 },
    );
  }
}
