import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";
import { getSettings } from "@/lib/settings";
import { sendContactMessage } from "@/lib/mail";

// Public contact form endpoint. Rate-limited to stop spam, and emails the
// message to the store's admin address (falls back to the store email).
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "contact", 5, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.VALIDATION(parsed.error.issues[0]?.message);
  }

  let adminEmail = "";
  try {
    const s = await getSettings();
    // Prefer the dedicated admin notification inbox, then the public store
    // email, then the SMTP account.
    adminEmail = s.adminEmail || s.storeEmail || s.smtpUser || s.smtpFrom || "";
    if (!adminEmail) {
      const admin = await prisma.user.findFirst({
        where: { role: "admin" },
        select: { email: true },
      });
      adminEmail = admin?.email ?? "";
    }
  } catch {
    adminEmail = "";
  }

  // Best-effort delivery: never fail the customer's submission just because
  // email is misconfigured (bad SMTP creds, unverified address, etc.). We log
  // the failure for the operator and still acknowledge the message.
  try {
    if (adminEmail) await sendContactMessage(adminEmail, parsed.data);
  } catch (err) {
    console.error("Failed to send contact message", err);
  }

  return ok({ message: "Thanks for reaching out! We'll reply soon." });
}
