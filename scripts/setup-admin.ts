/**
 * First-time admin setup.
 * Run: npx tsx scripts/setup-admin.ts
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

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existingAdmin) {
    console.log("\u26A0\uFE0F  Admin already set up. Use reset-admin-password.ts instead.");
    await rl.close();
    await prisma.$disconnect();
    return;
  }

  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = (await rl.question("Admin password (min 12, mixed case, number, symbol): ")).trim();
  const err = validatePassword(password);
  if (err) {
    console.log(`\u274C ${err}`);
    await rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
  const adminPath = (await rl.question("Secret admin panel path (e.g. my-secret-dashboard-2024): ")).trim();

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashed, name: "Administrator", role: "admin", emailVerified: true }
  });
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { adminPath },
    create: { id: "singleton", adminPath }
  });

  console.log(`\u2705 Admin created. Panel at: /${adminPath}`);
  await rl.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
