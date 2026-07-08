import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const user = await prisma.user.findUnique({
    where: { id: (admin as { id: string }).id },
  });
  if (!user) return Errors.NOT_FOUND();

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password,
  );
  if (!valid) return Errors.VALIDATION("Current password is incorrect.");

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    // Revoke all other sessions on password change.
    prisma.userSession.deleteMany({ where: { userId: user.id } }),
  ]);
  return ok({ message: "Password changed. Please sign in again." });
}
