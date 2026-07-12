import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { emit, broadcast, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendOrderInvoice } from "@/lib/mail";
import { orderRef, formatDate, formatInvoiceNumber } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { getPaypal, createPaypalOrder } from "@/lib/paypal";
import { getSettings } from "@/lib/settings";
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkCoupon, computeDiscount } from "@/lib/coupon";

export async function POST(req: Request) {
  // Shared limiter: cap checkout attempts per IP to blunt card-testing abuse.
  const limited = enforceRateLimit(req, "checkout", 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const { email, items, area, address, notes, paymentMethod, couponCode } =
    parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const settings = await getSettings();

  // Enforce the payment methods enabled in the admin panel.
  const methodEnabled: Record<string, boolean> = {
    cod: settings.codEnabled,
    stripe: settings.stripeEnabled,
    paypal: settings.paypalEnabled,
  };
  if (!methodEnabled[paymentMethod])
    return Errors.VALIDATION("That payment method is currently unavailable.");

  // Resolve the online-payment provider up front so we can fail fast.
  const stripeCtx = paymentMethod === "stripe" ? await getStripe() : null;
  const paypalCtx = paymentMethod === "paypal" ? await getPaypal() : null;
  if (paymentMethod === "stripe" && !stripeCtx)
    return Errors.VALIDATION("Card payments are not available right now.");
  if (paymentMethod === "paypal" && !paypalCtx)
    return Errors.VALIDATION("PayPal is not available right now.");

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
    // Snapshot the cost price so profit stays accurate if it changes later.
    return {
      productId: p.id,
      quantity: i.quantity,
      price: p.price,
      costPrice: p.costPrice,
    };
  });
  subtotal = Number(subtotal.toFixed(2));

  // Apply a promo code / coupon if supplied (re-validated server-side).
  let discount = 0;
  let appliedCoupon: { id: string; code: string } | null = null;
  if (couponCode && couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });
    const check = checkCoupon(coupon, subtotal);
    if (!check.ok) return Errors.VALIDATION(check.reason);
    discount = computeDiscount(coupon!, subtotal);
    appliedCoupon = { id: coupon!.id, code: coupon!.code };
  }

  const taxable = Number((subtotal - discount).toFixed(2));

  // Tax / VAT (optional, admin-configurable). Inclusive prices already contain
  // the tax, so we only surface the portion; exclusive prices add it on top.
  let tax = 0;
  if (settings.taxEnabled && settings.taxRate > 0) {
    const rate = settings.taxRate / 100;
    tax = settings.taxInclusive
      ? Number((taxable - taxable / (1 + rate)).toFixed(2))
      : Number((taxable * rate).toFixed(2));
  }

  // Delivery charge from the matching zone.
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const zone = zones.find((z) => z.areas.includes(area));
  if (!zone) return Errors.VALIDATION("We don't deliver to that area yet.");
  const isFree = zone.freeAbove != null && subtotal >= zone.freeAbove;
  const deliveryCharge = isFree ? 0 : zone.charge;

  // Inclusive tax is already inside item prices, so it is NOT added again.
  const total = Number(
    (taxable + (settings.taxInclusive ? 0 : tax) + deliveryCharge).toFixed(2),
  );

  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    // Atomically reserve the next sequential legal invoice number.
    const invoiceSeq = await prisma.$transaction(async (tx) => {
      const s = await tx.settings.update({
        where: { id: "singleton" },
        data: { nextInvoiceNumber: { increment: 1 } },
      });
      return s.nextInvoiceNumber - 1;
    });

    const order = await prisma.order.create({
      data: {
        userId,
        email,
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "unpaid" : "pending",
        subtotal,
        discount,
        couponCode: appliedCoupon?.code ?? null,
        tax,
        deliveryCharge,
        total,
        invoiceNumber: invoiceSeq,
        deliveryArea: area,
        address,
        notes,
        items: { create: orderItems },
      },
    });

    // Count the coupon usage once the order is committed.
    if (appliedCoupon) {
      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

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

    // Email the invoice to the customer and a copy to the store admin.
    const invoiceItems = orderItems.map((it) => {
      const p = products.find((x) => x.id === it.productId)!;
      return { name: p.name, quantity: it.quantity, price: it.price };
    });
    await sendOrderInvoice({
      ref: orderRef(order.id),
      invoiceNumber: formatInvoiceNumber(settings.invoicePrefix, invoiceSeq),
      email,
      date: formatDate(order.createdAt),
      items: invoiceItems,
      subtotal,
      discount,
      tax,
      taxLabel: settings.taxLabel,
      deliveryCharge,
      total,
      paymentMethod,
      paymentStatus: order.paymentStatus,
      address,
      storeName: settings.brandName || settings.storeName,
      storeEmail: settings.storeEmail,
      currencySymbol: settings.currencySymbol,
      adminEmail: settings.adminEmail || settings.storeEmail || undefined,
    });

    // Online payment: create the provider session and return a redirect URL.
    if (paymentMethod === "stripe" && stripeCtx) {
      const checkout = await stripeCtx.stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: (settings.currency || "USD").toLowerCase(),
              product_data: { name: `Order ${orderRef(order.id)}` },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id },
        success_url: `${appBase}/order-success?ref=${order.id}`,
        cancel_url: `${appBase}/checkout`,
      });
      return ok({ orderId: order.id, redirectUrl: checkout.url });
    }

    if (paymentMethod === "paypal" && paypalCtx) {
      const pp = await createPaypalOrder(paypalCtx, total, {
        currency: settings.currency || "USD",
        returnUrl: `${appBase}/api/paypal/capture?ref=${order.id}`,
        cancelUrl: `${appBase}/checkout`,
        reference: order.id,
      });
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
