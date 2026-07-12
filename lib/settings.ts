import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function getAdminPath(): Promise<string> {
  const s = await getSettings();
  return s.adminPath;
}
