import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deliveryZoneSchema } from "@/lib/validations";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  return ok(
    await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
  );
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const count = await prisma.deliveryZone.count();
  const zone = await prisma.deliveryZone.create({
    data: { ...parsed.data, sortOrder: parsed.data.sortOrder ?? count },
  });
  // Live update: checkout delivery options refresh on every open device.
  await broadcast(EVENTS.ZONE_UPDATED, { id: zone.id });
  return ok(zone, 201);
}
