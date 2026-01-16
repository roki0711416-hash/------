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

function resolveUserIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  // Our checkout endpoint sets client_reference_id = user.id.
  if (typeof session.client_reference_id === "string" && session.client_reference_id.trim()) {
    return session.client_reference_id.trim();
  }

  const metaUserId = session.metadata?.userId;
  if (typeof metaUserId === "string" && metaUserId.trim()) return metaUserId.trim();

  return null;
}

async function ensureUserStripeCustomerId(userId: string, customerId: string) {
  const db = getDb();
  if (!db) return;

  // Only fill when missing to avoid unintended overwrites.
  await db.sql`
    UPDATE users
    SET stripe_customer_id = COALESCE(stripe_customer_id, ${customerId})
    WHERE id = ${userId}
  `;
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
      // Speed up sync right after checkout completion.
      const sessionLite = event.data.object as Stripe.Checkout.Session;

      // Only handle subscriptions.
      if (sessionLite.mode !== "subscription") break;

      // Fetch expanded objects (webhook payload isn't expanded).
      const session = (await stripe.checkout.sessions.retrieve(sessionLite.id, {
        expand: ["subscription", "customer"],
      })) as Stripe.Checkout.Session;

      const userId = resolveUserIdFromCheckoutSession(session);
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      if (userId && customerId) {
        await ensureUserStripeCustomerId(userId, customerId);
      }

      const sub = session.subscription;
      if (sub && typeof sub !== "string") {
        const resolvedUserId = userId ?? (await resolveUserIdFromSubscription(sub));
        if (resolvedUserId) {
          await upsertSubscription(resolvedUserId, sub);
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
