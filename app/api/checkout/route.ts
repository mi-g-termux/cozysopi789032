import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { emit, broadcast, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendOrderConfirmation } from "@/lib/mail";
import { formatCurrency, orderRef } from "@/lib/utils";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { createPaypalOrder, paypalConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const { email, items, area, address, notes, paymentMethod } = parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Load products and validate stock server-side.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  if (products.length !== items.length)
    return Errors.VALIDATION("Some items are unavailable.");

  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = products.find((x) => x.id === i.productId)!;
    if (p.stock < i.quantity) throw new Error("stock");
    subtotal += p.price * i.quantity;
    return { productId: p.id, quantity: i.quantity, price: p.price };
  });

  // Delivery charge from the matching zone.
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const zone = zones.find((z) => z.areas.includes(area));
  if (!zone) return Errors.VALIDATION("We don't deliver to that area yet.");
  const isFree = zone.freeAbove != null && subtotal >= zone.freeAbove;
  const deliveryCharge = isFree ? 0 : zone.charge;
  const total = Number((subtotal + deliveryCharge).toFixed(2));

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        email,
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "unpaid" : "pending",
        subtotal,
        deliveryCharge,
        total,
        deliveryArea: area,
        address,
        notes,
        items: { create: orderItems },
      },
    });

    // Decrement stock and broadcast live updates to every open device.
    for (const it of orderItems) {
      const updated = await prisma.product.update({
        where: { id: it.productId },
        data: { stock: { decrement: it.quantity } },
      });
      await broadcast(EVENTS.STOCK_UPDATE, {
        id: updated.id,
        stock: updated.stock,
      });
    }

    // Notify admins of the new order (drives the dashboard toast).
    await emit(CHANNELS.ADMIN, EVENTS.NEW_ORDER, {
      id: order.id,
      total,
      email,
    });
    await sendOrderConfirmation(
      email,
      orderRef(order.id),
      formatCurrency(total),
    );

    // Online payment: create the provider session and return a redirect URL.
    if (paymentMethod === "stripe" && stripeConfigured) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `Order ${orderRef(order.id)}` },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id },
        success_url: `${base}/order-success?ref=${order.id}`,
        cancel_url: `${base}/checkout`,
      });
      return ok({ orderId: order.id, redirectUrl: checkout.url });
    }

    if (paymentMethod === "paypal" && paypalConfigured) {
      const pp = await createPaypalOrder(total);
      const approve = pp.links?.find(
        (l: { rel: string; href: string }) => l.rel === "approve",
      );
      return ok({
        orderId: order.id,
        paypalOrderId: pp.id,
        redirectUrl: approve?.href ?? null,
      });
    }

    return ok({ orderId: order.id, redirectUrl: null }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "stock") {
      return Errors.VALIDATION("Not enough stock for one of your items.");
    }
    return Errors.SERVER();
  }
}
