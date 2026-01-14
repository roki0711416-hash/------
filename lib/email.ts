import { Resend } from "resend";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    // Dev fallback: log instead of sending.
    console.log("[email:disabled]", { to: opts.to, subject: opts.subject });
    console.log(opts.html);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
