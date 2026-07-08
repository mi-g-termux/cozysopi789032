import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

type Transport = {
  transporter: nodemailer.Transporter;
  from: string;
};

/**
 * Build a mail transport, preferring the SMTP credentials configured in the
 * admin panel and falling back to the GMAIL_* environment variables.
 * Returns null when nothing is configured (dev fallback: log to console).
 */
async function getTransport(): Promise<Transport | null> {
  try {
    const s = await getSettings();
    if (s.smtpHost && s.smtpUser && s.smtpPassword) {
      const port = s.smtpPort ?? 587;
      return {
        transporter: nodemailer.createTransport({
          host: s.smtpHost,
          port,
          secure: s.smtpSecure ?? port === 465,
          auth: { user: s.smtpUser, pass: s.smtpPassword },
        }),
        from: s.smtpFrom || `"${s.storeName}" <${s.smtpUser}>`,
      };
    }
  } catch {
    // Settings unavailable (e.g. during build) \u2014 fall back to env vars.
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      }),
      from: `"Creamy" <${process.env.GMAIL_USER}>`,
    };
  }
  return null;
}

async function send(to: string, subject: string, html: string) {
  const t = await getTransport();
  if (!t) {
    // Dev fallback: log instead of throwing so the flow keeps working.
    console.log(
      `\u2709\uFE0F [mail:dev] To: ${to}\nSubject: ${subject}\n${html}`,
    );
    return;
  }
  await t.transporter.sendMail({ from: t.from, to, subject, html });
}

function wrap(title: string, body: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7f4ec;padding:32px;color:#111111">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
      <h1 style="font-family:Georgia,serif;color:#6bb6d6;margin:0 0 16px">${title}</h1>
      ${body}
      <p style="margin-top:32px;font-size:12px;color:#9a9a9a">Creamy \u2014 handcrafted ice cream, delivered.</p>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to: string, otp: string) {
  await send(
    to,
    "Verify your email",
    wrap(
      "Confirm your email",
      `<p>Welcome! Use the code below to verify your email. It expires in 15 minutes.</p>
       <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#6bb6d6">${otp}</p>`,
    ),
  );
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await send(
    to,
    "Reset your password",
    wrap(
      "Reset your password",
      `<p>Click the button below to choose a new password. This link expires in 1 hour.</p>
       <p><a href="${link}" style="display:inline-block;background:#6bb6d6;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none">Reset password</a></p>
       <p style="font-size:12px;color:#9a9a9a">If you didn't request this, you can ignore this email.</p>`,
    ),
  );
}

export async function sendLockoutAlert(to: string, ip: string) {
  await send(
    to,
    "Security alert: account locked",
    wrap(
      "Account temporarily locked",
      `<p>We detected 5 failed login attempts for your account from IP <strong>${ip}</strong>.</p>
       <p>Your account is locked for 1 hour as a precaution.</p>`,
    ),
  );
}

export async function sendOrderConfirmation(
  to: string,
  ref: string,
  total: string,
) {
  await send(
    to,
    `Order ${ref} confirmed`,
    wrap(
      "Thank you for your order!",
      `<p>Your order <strong>${ref}</strong> has been received.</p>
       <p>Order total: <strong>${total}</strong></p>
       <p>We'll email you when it's on the way.</p>`,
    ),
  );
}
