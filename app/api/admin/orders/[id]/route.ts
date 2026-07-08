import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { broadcast, EVENTS } from "@/lib/pusher";

const schema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: parsed.data,
  });
  // Live update: customer's order page AND admin list update on every device.
  await broadcast(EVENTS.ORDER_STATUS, { id: order.id, status: order.status });
  return ok(order);
}
