import { Resend } from "resend";

function getFromAddress() {
  return process.env.EMAIL_FROM?.trim() || null;
}

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendTransactionalEmail(args: {
  to: string;
  subject: string;
  text: string;
}) {
  const resend = getResend();
  const from = getFromAddress();

  if (!resend) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }

  await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
  });
}
