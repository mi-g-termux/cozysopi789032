import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { registerSchema } from "@/lib/validations";
import { generateOtp } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mail";
import { enforceRateLimit } from "@/lib/rate-limit";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "register", 5, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const email = parsed.data.email.toLowerCase().trim();
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const existing = await prisma.user.findUnique({ where: { email } });

  // Rule 1: duplicate email handling.
  if (existing && existing.emailVerified) {
    return Errors.CONFLICT(
      "An account with this email already exists. Please login instead.",
    );
  }
  if (existing && !existing.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiresAt },
    });
    await sendVerificationEmail(email, otp);
    return ok({ message: "We sent a new verification email to your inbox." });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      password: hashed,
      provider: "credentials",
      otpCode: otp,
      otpExpiresAt,
    },
  });
  await sendVerificationEmail(email, otp);
  // Live update: admin customers list reflects the new signup instantly.
  await broadcast(EVENTS.CUSTOMER_UPDATED, {});
  return ok(
    { message: "Account created. Check your email for a 6-digit code." },
    201,
  );
}
