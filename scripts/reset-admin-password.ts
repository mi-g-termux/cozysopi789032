/**
 * Reset an admin password from the terminal (no old password needed).
 * Run: npx tsx scripts/reset-admin-password.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const prisma = new PrismaClient();

function validatePassword(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include a symbol.";
  return null;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = (await rl.question("New password: ")).trim();
  const err = validatePassword(password);
  if (err) {
    console.log(`\u274C ${err}`);
    await rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "admin") {
    console.log("\u274C No admin found with that email.");
    await rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null }
    }),
    prisma.userSession.deleteMany({ where: { userId: user.id } })
  ]);

  console.log("\u2705 Admin password reset. All sessions cleared.");
  await rl.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
