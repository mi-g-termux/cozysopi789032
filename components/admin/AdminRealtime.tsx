"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getPusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusher";

// Subscribes admins to private-admin and shows live new-order toasts.
export function AdminRealtime() {
  const router = useRouter();
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;
    const channel = client.subscribe(CHANNELS.ADMIN);
    channel.bind(EVENTS.NEW_ORDER, (data: { email: string; total: number }) => {
      toast.success(`New order from ${data.email}!`);
      router.refresh();
    });
    return () => {
      channel.unbind_all();
      client.unsubscribe(CHANNELS.ADMIN);
    };
  }, [router]);
  return null;
}
