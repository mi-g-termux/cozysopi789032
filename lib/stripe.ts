import Stripe from "stripe";

export const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

export const stripe = stripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20"
    })
  : (null as unknown as Stripe);
