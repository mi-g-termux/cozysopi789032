import { getSettings } from "@/lib/settings";

const LIVE_BASE = "https://api-m.paypal.com";
const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

export type PaypalContext = {
  clientId: string;
  clientSecret: string;
  base: string;
  sandbox: boolean;
};

/**
 * Resolve active PayPal credentials from the admin panel, falling back to the
 * PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET environment variables. The sandbox
 * toggle selects the api-m.sandbox host; live mode uses api-m.paypal.com.
 * Returns null when PayPal is turned off or missing credentials.
 */
export async function getPaypal(): Promise<PaypalContext | null> {
  let clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  let enabled = !!clientId && !!clientSecret;
  let sandbox = (process.env.PAYPAL_API_BASE ?? SANDBOX_BASE).includes(
    "sandbox",
  );

  try {
    const s = await getSettings();
    if (typeof s.paypalEnabled === "boolean") enabled = s.paypalEnabled;
    if (s.paypalClientId) clientId = s.paypalClientId;
    if (s.paypalClientSecret) clientSecret = s.paypalClientSecret;
    if (typeof s.paymentSandbox === "boolean") sandbox = s.paymentSandbox;
  } catch {
    // Settings unavailable (e.g. during build) — fall back to env vars.
  }

  if (!enabled || !clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    base: sandbox ? SANDBOX_BASE : LIVE_BASE,
    sandbox,
  };
}

async function accessToken(ctx: PaypalContext): Promise<string> {
  const auth = Buffer.from(`${ctx.clientId}:${ctx.clientSecret}`).toString(
    "base64",
  );
  const res = await fetch(`${ctx.base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "PayPal auth failed");
  return data.access_token;
}

export async function createPaypalOrder(
  ctx: PaypalContext,
  amount: number,
  opts: {
    currency?: string;
    returnUrl: string;
    cancelUrl: string;
    reference?: string;
  },
) {
  const token = await accessToken(ctx);
  const res = await fetch(`${ctx.base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: opts.currency ?? "USD",
            value: amount.toFixed(2),
          },
          custom_id: opts.reference,
        },
      ],
      application_context: {
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to create PayPal order");
  return data;
}

/**
 * Refund a captured PayPal payment (full or partial). Pass the capture id
 * stored on the order (Order.paymentRef). Omit `amount` for a full refund.
 * Docs: POST /v2/payments/captures/{capture_id}/refund
 */
export async function refundPaypalCapture(
  ctx: PaypalContext,
  captureId: string,
  amount?: number,
  currency = "USD",
) {
  const token = await accessToken(ctx);
  const res = await fetch(
    `${ctx.base}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        amount != null
          ? { amount: { value: amount.toFixed(2), currency_code: currency } }
          : {},
      ),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to refund PayPal capture");
  return data;
}

export async function capturePaypalOrder(ctx: PaypalContext, orderId: string) {
  const token = await accessToken(ctx);
  const res = await fetch(`${ctx.base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to capture PayPal order");
  return data;
}
