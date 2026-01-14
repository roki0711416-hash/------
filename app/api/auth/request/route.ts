import { NextResponse } from "next/server";
import { createLoginToken, createOrGetUserByEmail } from "../../../../lib/auth";
import { sendEmail } from "../../../../lib/email";
import { getSiteUrl } from "../../../../lib/site";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const emailRaw = String(form.get("email") ?? "");
  const user = await createOrGetUserByEmail(emailRaw);
  if (!user) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { token } = await createLoginToken(user.id);
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/api/auth/callback?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: user.email,
    subject: "【スロカスくん】ログインリンク",
    html: `
      <p>下記リンクからログインしてください（有効期限あり）。</p>
      <p><a href="${url}">${url}</a></p>
    `.trim(),
  });

  return NextResponse.redirect(`${siteUrl}/login?sent=1`, { status: 303 });
}
