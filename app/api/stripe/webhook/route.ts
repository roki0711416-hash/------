import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../../lib/stripe";
import { getDb } from "../../../../lib/db";
import { upsertSubscription } from "../../../../lib/stripeSubscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUserIdFromSubscription(sub: Stripe.Subscription) {
  const metaUserId = sub.metadata?.userId;
  if (metaUserId) return metaUserId;

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const db = getDb();
  if (!db) return null;

  const { rows } = await db.sql`
    SELECT id FROM users WHERE stripe_customer_id = ${customerId} LIMIT 1
  `;

  const row = rows[0] as { id: string } | undefined;
  return row?.id ?? null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が未設定です" },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET が未設定です" },
      { status: 503 },
    );
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
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

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(sub);
      if (userId) {
        await upsertSubscription(userId, sub);
      }
      break;
    }
    case "checkout.session.completed": {
      // subscription.updated で同期するので、ここでは特に必須の処理はしない
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
