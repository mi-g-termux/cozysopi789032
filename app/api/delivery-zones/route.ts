import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";

// Public: returns all active zones with areas and charges (used by checkout).
export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" }
    });
    return ok(zones);
  } catch {
    return Errors.SERVER();
  }
}
