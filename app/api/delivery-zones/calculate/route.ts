import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { calculateDeliverySchema } from "@/lib/validations";
import type { CalculateDeliveryResult } from "@/types";

// POST { area, subtotal } -> zone, charge, isFree, remainingForFree, estimate
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = calculateDeliverySchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const { area, subtotal } = parsed.data;
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const zone = zones.find((z) => z.areas.includes(area));
  if (!zone) return Errors.NOT_FOUND("We don't deliver to that area yet.");

  const qualifiesFree = zone.freeAbove != null && subtotal >= zone.freeAbove;
  const remainingForFree =
    zone.freeAbove != null && !qualifiesFree
      ? Number((zone.freeAbove - subtotal).toFixed(2))
      : null;

  const result: CalculateDeliveryResult = {
    zone: zone.name,
    charge: qualifiesFree ? 0 : zone.charge,
    isFree: qualifiesFree,
    freeAboveAmount: zone.freeAbove,
    remainingForFree,
    estimatedDelivery: zone.estimatedDays,
  };
  return ok(result);
}
