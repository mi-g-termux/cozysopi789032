import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBackupCodes } from "@/lib/utils";

// Generates a TOTP secret + QR + backup codes. Stored but not enabled until verified.
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const user = admin as { id: string; email: string };

  const secret = speakeasy.generateSecret({ name: `Cozy Bites (${user.email})` });
  const backupCodes = generateBackupCodes();
  const qr = await QRCode.toDataURL(secret.otpauth_url ?? "");

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret.base32, backupCodes }
  });

  return ok({ qr, secret: secret.base32, backupCodes });
}
