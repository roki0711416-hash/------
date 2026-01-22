"use client";

import { STRIPE_PAYMENT_LINK_URL } from "../lib/stripePaymentLink";

export default function SubscribeCheckoutButton({
  showYearly = true,
}: {
  showYearly?: boolean;
}) {
  void showYearly;

  return (
    <div className="mt-3 space-y-2">
      <a
        href={STRIPE_PAYMENT_LINK_URL}
        className="block w-full rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white"
        target="_blank"
        rel="noreferrer"
      >
        2日間無料で試す（その後 月額680円）
      </a>
    </div>
  );
}
