import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deliveryZoneSchema } from "@/lib/validations";
import { emit, CHANNELS, EVENTS } from "@/lib/pusher";

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = deliveryZoneSchema.partial().safeParse(body);
  if (!parsed.success) return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const zone = await prisma.deliveryZone.update({ where: { id: params.id }, data: parsed.data });
  await emit(CHANNELS.SHOP, EVENTS.ZONE_UPDATED, { id: zone.id });
  return ok(zone);
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  await prisma.deliveryZone.delete({ where: { id: params.id } });
  await emit(CHANNELS.SHOP, EVENTS.ZONE_UPDATED, { id: params.id });
  return ok({ deleted: true });
}
