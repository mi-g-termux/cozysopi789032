"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getPusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusher";

/**
 * Admin live-updater. Subscribes to the private-admin channel and keeps every
 * admin page (dashboard, orders, products, zones, customers) in sync across
 * devices by re-fetching on any broadcast. Also shows a toast for new orders.
 */
export function AdminRealtime() {
  const router = useRouter();
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;
    const channel = client.subscribe(CHANNELS.ADMIN);

    channel.bind(EVENTS.NEW_ORDER, (data: { email?: string }) => {
      toast.success(`New order${data?.email ? ` from ${data.email}` : ""}!`);
    });

    // Refresh admin views on ANY change (orders, products, zones, settings...).
    const handler = (eventName: string) => {
      if (eventName.startsWith("pusher:")) return;
      router.refresh();
    };
    channel.bind_global(handler);

    return () => {
      channel.unbind_global(handler);
      channel.unbind_all();
      client.unsubscribe(CHANNELS.ADMIN);
    };
  }, [router]);
  return null;
}
