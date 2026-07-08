import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { verifyEmailSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`verify:${ip}`, 10, 60_000).allowed)
    return Errors.RATE_LIMIT();

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
