import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mustGetPool } from "../../../../lib/db";
import { getStripe } from "../../../../lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "bad_signature" }, { status: 400 });
  }

  const db = mustGetPool();

  const upsertFromSub = async (sub: Stripe.Subscription) => {
    const customerId =
      typeof sub.customer === "string"
        ? sub.customer
        : "id" in sub.customer && typeof sub.customer.id === "string"
          ? sub.customer.id
          : null;
    if (!customerId) return;

    const status = typeof sub.status === "string" ? sub.status : null;
    const periodEndSec = (() => {
      const items = sub.items?.data ?? [];
      if (items.length === 0) return null;
      return items.reduce((max, it) => Math.max(max, it.current_period_end), 0);
    })();
    const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

    await db.sql`
      UPDATE users
      SET stripe_subscription_id = ${sub.id},
          subscription_status = ${status},
          subscription_current_period_end = ${periodEnd}
      WHERE stripe_customer_id = ${customerId}
    `;
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertFromSub(event.data.object);
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      // Not strictly needed if subscription.updated is enabled.
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
