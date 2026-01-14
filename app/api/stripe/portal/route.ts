import { NextResponse } from "next/server";
import { getViewer } from "../../../../lib/auth";
import { mustGetPool } from "../../../../lib/db";
import { getSiteUrl } from "../../../../lib/site";
import { getStripe } from "../../../../lib/stripe";

export async function POST() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${getSiteUrl()}/login`, { status: 303 });

  const db = mustGetPool();
  const siteUrl = getSiteUrl();
  const stripe = getStripe();

  const { rows } = await db.sql`
    SELECT stripe_customer_id FROM users WHERE id = ${viewer.userId} LIMIT 1
  `;
  const customerId = (rows[0] as { stripe_customer_id: string | null } | undefined)
    ?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.redirect(`${siteUrl}/account?portal=no_customer`, { status: 303 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/account`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
