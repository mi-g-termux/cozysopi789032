import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { broadcast, EVENTS } from "@/lib/pusher";
import { getStripe, refundStripePayment } from "@/lib/stripe";
import { getPaypal, refundPaypalCapture } from "@/lib/paypal";
import { getSettings } from "@/lib/settings";

const schema = z.object({ amount: z.number().positive().optional() });

/**
 * Refund an order (admin only). Issues a real Stripe / PayPal refund against
 * the stored payment reference, or simply records the refund for COD orders.
 * Omit `amount` for a full refund of the remaining balance; pass a positive
 * `amount` for a partial refund.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return Errors.VALIDATION();

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return Errors.NOT_FOUND("Order not found.");
  if (order.paymentStatus === "refunded")
    return Errors.CONFLICT("This order is already fully refunded.");

  const remaining = Number((order.total - order.refundedAmount).toFixed(2));
  if (remaining <= 0)
    return Errors.CONFLICT("Nothing left to refund on this order.");

  const amount = parsed.data.amount;
  if (amount != null && amount > remaining + 0.001)
    return Errors.VALIDATION(
      "Refund amount exceeds the remaining order balance.",
    );
  const refundAmount = Number((amount ?? remaining).toFixed(2));

  try {
    // Only call the gateway for online payments that were actually charged.
    const wasCharged =
      order.paymentStatus === "paid" || order.refundedAmount > 0;
    if (wasCharged && order.paymentMethod === "stripe") {
      const ctx = await getStripe();
      if (!ctx || !order.paymentRef)
        return Errors.VALIDATION("No Stripe payment reference to refund.");
      await refundStripePayment(ctx, order.paymentRef, amount);
    } else if (wasCharged && order.paymentMethod === "paypal") {
      const ctx = await getPaypal();
      if (!ctx || !order.paymentRef)
        return Errors.VALIDATION("No PayPal capture reference to refund.");
      const settings = await getSettings();
      await refundPaypalCapture(
        ctx,
        order.paymentRef,
        amount,
        settings.currency || "USD",
      );
    }
    // COD orders: no gateway call \u2014 we just record the refund below.

    const newRefunded = Number(
      (order.refundedAmount + refundAmount).toFixed(2),
    );
    const fully = newRefunded >= order.total - 0.001;
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: newRefunded,
        refundedAt: new Date(),
        refundStatus: fully ? "full" : "partial",
        paymentStatus: fully ? "refunded" : order.paymentStatus,
      },
    });

    await broadcast(EVENTS.ORDER_STATUS, {
      id: updated.id,
      status: updated.status,
    });
    return ok(updated);
  } catch (err) {
    console.error("Refund failed", err);
    return Errors.SERVER();
  }
}
