import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function POST(req: Request) {
  if (!stripeConfigured)
    return new Response("Stripe not configured", { status: 400 });
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event;
  try {
    event =
      secret && sig
        ? stripe.webhooks.constructEvent(raw, sig, secret)
        : JSON.parse(raw);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "paid", status: "confirmed" },
      });
      await broadcast(EVENTS.ORDER_STATUS, {
        id: order.id,
        status: order.status,
      });
    }
  }
  return new Response("ok", { status: 200 });
}
