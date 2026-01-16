import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../../lib/stripe";
import { getDb } from "../../../../lib/db";
import { upsertSubscription } from "../../../../lib/stripeSubscription";
import { sendTransactionalEmail } from "../../../../lib/email";
import { getBaseUrl } from "../../../../lib/baseUrl";

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

async function getUserEmailById(userId: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const { rows } = await db.sql`
    SELECT email FROM users WHERE id = ${userId} LIMIT 1
  `;
  const row = rows[0] as { email: string } | undefined;
  return row?.email ?? null;
}

async function getUserEmailByStripeCustomerId(customerId: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const { rows } = await db.sql`
    SELECT email FROM users WHERE stripe_customer_id = ${customerId} LIMIT 1
  `;
  const row = rows[0] as { email: string } | undefined;
  return row?.email ?? null;
}

async function safeSendEmail(args: { to: string; subject: string; text: string }) {
  try {
    await sendTransactionalEmail(args);
  } catch (e) {
    console.error("email_send_failed", e);
  }
}

async function markEmailEventOnce(stripeEventId: string, eventType: string): Promise<boolean> {
  const db = getDb();
  if (!db) return true; // DB unavailable case is handled earlier, but keep safe.

  const { rows } = await db.sql`
    INSERT INTO stripe_webhook_email_events (stripe_event_id, event_type)
    VALUES (${stripeEventId}, ${eventType})
    ON CONFLICT (stripe_event_id) DO NOTHING
    RETURNING stripe_event_id
  `;

  return rows.length > 0;
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

      const shouldSend = await markEmailEventOnce(event.id, event.type);

      // Fetch expanded objects (webhook payload isn't expanded).
      const session = (await stripe.checkout.sessions.retrieve(sessionLite.id, {
        expand: ["subscription", "customer"],
      })) as Stripe.Checkout.Session;

      const userId = resolveUserIdFromCheckoutSession(session);
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      const baseUrl = getBaseUrl();

      // Send success email (best-effort).
      try {
        if (shouldSend) {
          const emailFromDb = userId ? await getUserEmailById(userId) : null;
          const emailFromStripe =
            session.customer_details?.email ?? session.customer_email ?? null;
          const to = emailFromDb ?? emailFromStripe;

          if (to) {
            await safeSendEmail({
              to,
              subject: "【Slokasu】お支払い（登録）が完了しました",
              text: `ご利用ありがとうございます。\n\n登録（決済）が完了しました。\nアカウントページからプラン管理/解約ができます。\n\n${baseUrl}/account`,
            });
          }
        }
      } catch (e) {
        console.error("checkout_completed_email_failed", e);
      }

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
    case "invoice.payment_failed": {
      const shouldSend = await markEmailEventOnce(event.id, event.type);
      if (!shouldSend) break;

      const invoice = event.data.object as Stripe.Invoice;
      const baseUrl = getBaseUrl();

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;

      const emailFromDb = customerId
        ? await getUserEmailByStripeCustomerId(customerId)
        : null;

      const emailFromStripe = invoice.customer_email ?? null;

      const to = emailFromDb ?? emailFromStripe;
      if (to) {
        const amountDue =
          typeof invoice.amount_due === "number"
            ? `${(invoice.amount_due / 100).toFixed(0)} ${String(invoice.currency ?? "").toUpperCase()}`
            : null;
        const hostedUrl =
          typeof invoice.hosted_invoice_url === "string" ? invoice.hosted_invoice_url : null;

        await safeSendEmail({
          to,
          subject: "【Slokasu】お支払いに失敗しました",
          text:
            `お支払いの処理に失敗しました。\n` +
            (amountDue ? `請求額: ${amountDue}\n` : "") +
            (hostedUrl ? `請求書URL: ${hostedUrl}\n` : "") +
            `\n支払い方法の更新や状況確認はアカウントページから行えます。\n\n${baseUrl}/account`,
        });
      }

      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
