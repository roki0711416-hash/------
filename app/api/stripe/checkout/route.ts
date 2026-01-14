import { NextResponse } from "next/server";
import { getViewer } from "../../../../lib/auth";
import { mustGetPool } from "../../../../lib/db";
import { getSiteUrl } from "../../../../lib/site";
import { getStripe, getStripePriceId } from "../../../../lib/stripe";

export async function POST() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${getSiteUrl()}/login`, { status: 303 });

  const db = mustGetPool();
  const siteUrl = getSiteUrl();
  const stripe = getStripe();

  // Ensure customer
  const { rows } = await db.sql`
    SELECT stripe_customer_id FROM users WHERE id = ${viewer.userId} LIMIT 1
  `;
  const customerId = (rows[0] as { stripe_customer_id: string | null } | undefined)
    ?.stripe_customer_id;

  const ensuredCustomerId = customerId
    ? customerId
    : (
        await (async () => {
          const customer = await stripe.customers.create({ email: viewer.email });
          await db.sql`
            UPDATE users SET stripe_customer_id = ${customer.id}
            WHERE id = ${viewer.userId}
          `;
          return customer.id;
        })()
      );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: ensuredCustomerId,
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    success_url: `${siteUrl}/account?checkout=success`,
    cancel_url: `${siteUrl}/account?checkout=cancel`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.redirect(`${siteUrl}/account?checkout=error`, { status: 303 });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
