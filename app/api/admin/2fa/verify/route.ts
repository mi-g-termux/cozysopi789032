import speakeasy from "speakeasy";
import { z } from "zod";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(6).max(8),
  enable: z.boolean().default(true),
});

// Verifies a TOTP code and toggles twoFactorEnabled.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const user = await prisma.user.findUnique({
    where: { id: (admin as { id: string }).id },
  });
  if (!user?.twoFactorSecret) return Errors.VALIDATION("Set up 2FA first.");

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: parsed.data.token,
    window: 1,
  });
  if (!valid) return Errors.VALIDATION("Invalid 2FA code.");

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: parsed.data.enable },
  });
  return ok({ enabled: parsed.data.enable });
}
