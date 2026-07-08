"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher-client";
import { CHANNELS } from "@/lib/pusher";

/**
 * Global storefront live-updater. Mounted once in the root layout so EVERY
 * public page (home, shop, product, cart, checkout, account) stays in sync
 * across devices. Any admin-driven change broadcast to the public channel
 * triggers a server re-fetch via router.refresh(), which re-renders the
 * current route with fresh data without a full reload.
 */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;
    const channel = client.subscribe(CHANNELS.SHOP);
    // Refresh on ANY broadcast event (products, stock, zones, settings, orders).
    const handler = (eventName: string) => {
      if (eventName.startsWith("pusher:")) return;
      router.refresh();
    };
    channel.bind_global(handler);
    return () => {
      channel.unbind_global(handler);
      client.unsubscribe(CHANNELS.SHOP);
    };
  }, [router]);
  return null;
}
