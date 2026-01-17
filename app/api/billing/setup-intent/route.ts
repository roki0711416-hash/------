import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireCurrentUserOrJsonError } from "../../../../lib/auth";
import { getStripe } from "../../../../lib/stripe";
import { getBaseUrl } from "../../../../lib/baseUrl";
import { getSubscriptionForUserId, hasAnyActiveishSubscription } from "../../../../lib/premium";
import { isAdminRole } from "../../../../lib/roles";

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
    // ignore
  }
  return "monthly";
}

function getPriceIdForPlan(plan: Plan) {
  if (plan === "yearly") return process.env.STRIPE_PRICE_ID_YEARLY;

  // Backward compatible: STRIPE_PRICE_ID is treated as monthly.
  return process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.STRIPE_PRICE_ID;
}

export async function POST(req: Request) {
  const auth = await requireCurrentUserOrJsonError();
  if (!auth.ok) return auth.response;

  // 管理者は課金不要（会員機能はroleで常時解放）
  if (isAdminRole(auth.user.role)) {
    return NextResponse.json({ error: "管理者アカウントは課金不要です" }, { status: 409 });
  }

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

  const existingSub = await getSubscriptionForUserId(auth.user.id);
  const hasAnyActiveishSub = hasAnyActiveishSubscription(existingSub);

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

    return NextResponse.json({ redirectUrl: portal.url });
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email,
      metadata: { userId: auth.user.id },
    });
    customerId = customer.id;

    await db.sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${auth.user.id};`;
  }

  // 7日トライアルでもカード登録は必須にしたいので、SetupIntentで支払い方法を先に登録する
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: { userId: auth.user.id, plan, priceId },
  });

  if (!setupIntent.client_secret) {
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 },
    );
  }

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
