import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`reset:${ip}`, 5, 60_000).allowed) return Errors.RATE_LIMIT();

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const user = await prisma.user.findUnique({
    where: { resetToken: parsed.data.token },
  });
  if (
    !user ||
    !user.resetTokenExpiresAt ||
    user.resetTokenExpiresAt < new Date()
  ) {
    return Errors.VALIDATION("This reset link is invalid or has expired.");
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiresAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    // Security: clear all existing sessions so old devices are logged out.
    prisma.userSession.deleteMany({ where: { userId: user.id } }),
  ]);

  return ok({ message: "Password updated. Please sign in." });
}
