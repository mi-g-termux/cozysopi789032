import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaypal, capturePaypalOrder } from "@/lib/paypal";
import { broadcast, EVENTS } from "@/lib/pusher";

/**
 * PayPal return URL. After the buyer approves the payment PayPal redirects
 * here with ?token=<paypalOrderId>&ref=<ourOrderId>. We capture the funds,
 * mark the order paid, broadcast the change, then redirect to order-success.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const paypalOrderId = url.searchParams.get("token");
  const ref = url.searchParams.get("ref");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!paypalOrderId || !ref) {
    return NextResponse.redirect(`${base}/checkout?error=paypal`);
  }

  const ctx = await getPaypal();
  if (!ctx) return NextResponse.redirect(`${base}/checkout?error=paypal`);

  try {
    const result = await capturePaypalOrder(ctx, paypalOrderId);
    if (result?.status === "COMPLETED") {
      // Store the capture id so admins can later refund this order.
      const captureId =
        result?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
      const order = await prisma.order.update({
        where: { id: ref },
        data: {
          paymentStatus: "paid",
          status: "confirmed",
          paymentRef: captureId,
        },
      });
      await broadcast(EVENTS.ORDER_STATUS, {
        id: order.id,
        status: order.status,
      });
      return NextResponse.redirect(`${base}/order-success?ref=${ref}`);
    }
    return NextResponse.redirect(`${base}/checkout?error=paypal`);
  } catch {
    return NextResponse.redirect(`${base}/checkout?error=paypal`);
  }
}
