import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { broadcast, EVENTS } from "@/lib/pusher";
import { getSettings } from "@/lib/settings";
import { sendOrderStatusUpdate } from "@/lib/mail";
import { orderRef } from "@/lib/utils";

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

  const existing = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return Errors.NOT_FOUND("Order not found.");

  const order = await prisma.order.update({
    where: { id: params.id },
    data: parsed.data,
  });

  // Cancelling an order returns its items to stock exactly once.
  if (parsed.data.status === "cancelled" && existing.status !== "cancelled") {
    for (const it of existing.items) {
      try {
        const updated = await prisma.product.update({
          where: { id: it.productId },
          data: { stock: { increment: it.quantity } },
        });
        await broadcast(EVENTS.STOCK_UPDATE, {
          id: updated.id,
          stock: updated.stock,
        });
      } catch {
        // Product may have been deleted; skip restocking it.
      }
    }
  }

  // Live update: customer's order page AND admin list update on every device.
  await broadcast(EVENTS.ORDER_STATUS, { id: order.id, status: order.status });

  // Email the customer when their order status changes (if SMTP is set up).
  if (parsed.data.status) {
    try {
      const s = await getSettings();
      await sendOrderStatusUpdate(
        order.email,
        orderRef(order.id),
        order.status,
        s.storeName,
      );
    } catch {
      // Non-fatal: the status update still succeeds even if the email fails.
    }
  }
  return ok(order);
}
