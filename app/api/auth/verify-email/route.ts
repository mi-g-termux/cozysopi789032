import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { verifyEmailSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "verify", 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Errors.NOT_FOUND("No account found for that email.");

  if (user.emailVerified) return ok({ message: "Email already verified." });

  const valid =
    user.otpCode === parsed.data.otp &&
    user.otpExpiresAt != null &&
    user.otpExpiresAt > new Date();
  if (!valid) return Errors.VALIDATION("That code is invalid or has expired.");

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
  });
  return ok({ message: "Email verified. You're all set." });
}
