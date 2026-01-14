import { NextResponse } from "next/server";
import { getViewer, canRequestDeviceReset, createDeviceResetToken } from "../../../../../lib/auth";
import { getSiteUrl } from "../../../../../lib/site";
import { sendEmail } from "../../../../../lib/email";

export async function POST() {
  const viewer = await getViewer();
  const siteUrl = getSiteUrl();
  if (!viewer) {
    return NextResponse.redirect(`${siteUrl}/login`, { status: 303 });
  }

  const limit = await canRequestDeviceReset(viewer.userId);
  if (!limit.ok) {
    return NextResponse.redirect(`${siteUrl}/account?reset=rate`, { status: 303 });
  }

  const token = await createDeviceResetToken(viewer.userId);
  const url = `${siteUrl}/api/device/reset/callback?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: viewer.email,
    subject: "【スロカスくん】端末解除リンク",
    html: `
      <p>端末解除のリンクです（有効期限あり）。</p>
      <p>※24時間で3回まで送信できます。</p>
      <p><a href="${url}">${url}</a></p>
    `.trim(),
  });

  return NextResponse.redirect(`${siteUrl}/account?reset=sent`, { status: 303 });
}
