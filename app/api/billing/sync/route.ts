import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireCurrentUserOrJsonError } from "../../../../lib/auth";
import { getDb } from "../../../../lib/db";
import { getStripe } from "../../../../lib/stripe";
import { upsertSubscription } from "../../../../lib/stripeSubscription";

export const runtime = "nodejs";

function readSessionIdFromBody(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const v = (json as Record<string, unknown>).sessionId;
  return typeof v === "string" && v.trim() ? v : null;
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

  let sessionId: string | null = null;
  try {
    const json = (await req.json()) as unknown;
    sessionId = readSessionIdFromBody(json);
  } catch {
    // ignore
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId が不正です" }, { status: 400 });
  }

  const session = (await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })) as Stripe.Checkout.Session;

  // Basic ownership checks.
  if (session.client_reference_id && session.client_reference_id !== auth.user.id) {
    return NextResponse.json({ error: "このセッションは同期できません" }, { status: 403 });
  }

  if (auth.user.stripeCustomerId) {
    const sessionCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

    if (sessionCustomerId && sessionCustomerId !== auth.user.stripeCustomerId) {
      return NextResponse.json({ error: "このセッションは同期できません" }, { status: 403 });
    }
  }

  const subscription = session.subscription as Stripe.Subscription | string | null;
  if (!subscription || typeof subscription === "string") {
    // If it's a one-time payment or not yet attached, webhook will handle later.
    return NextResponse.json({ ok: true, synced: false });
  }

  await upsertSubscription(auth.user.id, subscription);

  return NextResponse.json({ ok: true, synced: true });
}
