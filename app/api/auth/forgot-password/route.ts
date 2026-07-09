import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateToken } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/mail";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "forgot", 5, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only send for real credential accounts, but always return the same message
  // so we never leak whether an email is registered.
  if (user && user.provider === "credentials") {
    const token = generateToken();
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(
      email,
      `${base}/reset-password?token=${token}`,
    );
  }

  return ok({
    message: "If that email is registered, a reset link is on its way.",
  });
}
