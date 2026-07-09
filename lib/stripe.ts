import Stripe from "stripe";
import { getSettings } from "@/lib/settings";

const API_VERSION = "2024-06-20" as const;

export type StripeContext = {
  stripe: Stripe;
  webhookSecret: string;
  sandbox: boolean;
};

/**
 * Resolve an active Stripe client from the admin-panel settings, falling back
 * to the STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET environment variables.
 * Returns null when Stripe is turned off in the admin panel or has no key.
 *
 * Stripe uses the same endpoint for live and test (sandbox) mode; a test key
 * (sk_test_...) automatically runs in sandbox. The `sandbox` flag simply
 * mirrors the admin toggle so the UI can show which mode is active.
 */
export async function getStripe(): Promise<StripeContext | null> {
  let key = process.env.STRIPE_SECRET_KEY ?? "";
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let enabled = !!key;
  let sandbox = key.startsWith("sk_test_");

  try {
    const s = await getSettings();
    if (typeof s.stripeEnabled === "boolean") enabled = s.stripeEnabled;
    if (s.stripeSecretKey) key = s.stripeSecretKey;
    if (s.stripeWebhookSecret) webhookSecret = s.stripeWebhookSecret;
    if (typeof s.paymentSandbox === "boolean") sandbox = s.paymentSandbox;
  } catch {
    // Settings unavailable (e.g. during build) — fall back to env vars.
  }

  if (!enabled || !key) return null;
  return {
    stripe: new Stripe(key, { apiVersion: API_VERSION }),
    webhookSecret,
    sandbox,
  };
}

/**
 * Refund a Stripe payment (full or partial). Pass the PaymentIntent id stored
 * on the order (Order.paymentRef). Omit `amount` for a full refund; provide a
 * major-unit amount (e.g. 12.50) for a partial refund.
 */
export async function refundStripePayment(
  ctx: StripeContext,
  paymentIntentId: string,
  amount?: number,
) {
  return ctx.stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount != null ? { amount: Math.round(amount * 100) } : {}),
  });
}

/** Env-only flag kept for backwards compatibility. Prefer getStripe(). */
export const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
