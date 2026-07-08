import Pusher from "pusher";

export const pusherConfigured =
  !!process.env.PUSHER_APP_ID &&
  !!process.env.PUSHER_KEY &&
  !!process.env.PUSHER_SECRET &&
  !!process.env.PUSHER_CLUSTER;

export const pusherServer = pusherConfigured
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true
    })
  : null;

export const CHANNELS = {
  ADMIN: "private-admin",
  SHOP: "public-shop"
} as const;

// Every admin-driven change fires one of these. Clients refresh on any of them.
export const EVENTS = {
  NEW_ORDER: "new-order",
  STOCK_UPDATE: "stock-update",
  ORDER_STATUS: "order-status",
  ZONE_UPDATED: "zone-updated",
  PRODUCT_UPDATED: "product-updated",
  PRODUCT_DELETED: "product-deleted",
  SETTINGS_UPDATED: "settings-updated",
  CUSTOMER_UPDATED: "customer-updated"
} as const;

/** Fire-and-forget trigger that no-ops when Pusher isn't configured. */
export async function emit(channel: string, event: string, payload: unknown) {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger(channel, event, payload);
  } catch (err) {
    console.error("[pusher] trigger failed", err);
  }
}

/**
 * Broadcast a change to BOTH the public storefront and the admin panel so it
 * appears instantly on every open device (customers and admins alike).
 */
export async function broadcast(event: string, payload: unknown = {}) {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger([CHANNELS.SHOP, CHANNELS.ADMIN], event, payload);
  } catch (err) {
    console.error("[pusher] broadcast failed", err);
  }
}
