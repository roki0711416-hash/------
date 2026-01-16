import { NextResponse } from "next/server";
import { requireCurrentUserOrJsonError } from "../../../../lib/auth";
import { getStripe } from "../../../../lib/stripe";
import { getBaseUrl } from "../../../../lib/baseUrl";

export const runtime = "nodejs";

function asStripeLikeError(err: unknown): {
  type?: string;
  code?: string;
  statusCode?: number;
} {
  if (!err || typeof err !== "object") return {};
  const rec = err as Record<string, unknown>;
  return {
    type: typeof rec.type === "string" ? rec.type : undefined,
    code: typeof rec.code === "string" ? rec.code : undefined,
    statusCode: typeof rec.statusCode === "number" ? rec.statusCode : undefined,
  };
}

export async function POST() {
  const auth = await requireCurrentUserOrJsonError();
  if (!auth.ok) return auth.response;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が未設定です" },
      { status: 503 },
    );
  }

  if (!auth.user.stripeCustomerId) {
    return NextResponse.json(
      { error: "Stripe customer が未作成です" },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl();

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: auth.user.stripeCustomerId,
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const e = asStripeLikeError(err);
    const hint =
      e.type === "StripeAuthenticationError" || e.statusCode === 401
        ? "Stripeの認証に失敗しました。STRIPE_SECRET_KEY を省略せずに設定してください（sk_test_... / sk_live_...）。"
        : "Stripeリクエストに失敗しました。環境変数（STRIPE_SECRET_KEY）を確認してください。";
    return NextResponse.json(
      {
        error: hint,
        ...(process.env.NODE_ENV !== "production"
          ? { debug: { type: e.type, code: e.code, statusCode: e.statusCode } }
          : null),
      },
      { status: 503 },
    );
  }
}
