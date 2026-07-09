import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function POST(req: Request) {
  const ctx = await getStripe();
  if (!ctx) return new Response("Stripe not configured", { status: 400 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event;
  try {
    event =
      ctx.webhookSecret && sig
        ? ctx.stripe.webhooks.constructEvent(raw, sig, ctx.webhookSecret)
        : JSON.parse(raw);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionObj = event.data.object;
    const orderId = sessionObj.metadata?.orderId;
    if (orderId) {
      // Store the PaymentIntent id so admins can later refund this order.
      const paymentRef =
        typeof sessionObj.payment_intent === "string"
          ? sessionObj.payment_intent
          : (sessionObj.payment_intent?.id ?? null);
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "paid", status: "confirmed", paymentRef },
      });
      await broadcast(EVENTS.ORDER_STATUS, {
        id: order.id,
        status: order.status,
      });
    }
  }
  return new Response("ok", { status: 200 });
}
