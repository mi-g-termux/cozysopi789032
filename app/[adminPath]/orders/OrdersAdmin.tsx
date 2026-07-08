"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatCurrency, formatDate, orderRef } from "@/lib/utils";
import type { OrderDTO } from "@/types";

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out-for-delivery",
  "delivered",
  "cancelled",
];

export function OrdersAdmin({ initial }: { initial: OrderDTO[] }) {
  const [orders, setOrders] = useState<OrderDTO[]>(initial);

  // Absorb server-refreshed data pushed by the realtime layer (live sync).
  useEffect(() => setOrders(initial), [initial]);
  const [open, setOpen] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Order updated");
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl">Orders</h1>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Email</th>
              <th className="p-3">Area</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <>
                <tr
                  key={o.id}
                  className="cursor-pointer border-t border-secondary/40"
                  onClick={() => setOpen(open === o.id ? null : o.id)}
                >
                  <td className="p-3 font-medium">{orderRef(o.id)}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3">{o.deliveryArea}</td>
                  <td className="p-3 capitalize">
                    {o.paymentMethod} \u00B7 {o.paymentStatus}
                  </td>
                  <td className="p-3">{formatCurrency(o.total)}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-lg border border-secondary bg-white px-2 py-1 capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{formatDate(o.createdAt)}</td>
                </tr>
                {open === o.id ? (
                  <tr key={`${o.id}-detail`} className="bg-cream/60">
                    <td colSpan={7} className="p-4">
                      <div className="space-y-1 text-sm">
                        {o.items.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>
                              {it.product.name} \u00D7 {it.quantity}
                            </span>
                            <span>
                              {formatCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="mt-2 flex justify-between border-t border-secondary/40 pt-2">
                          <span>Delivery</span>
                          <span>{formatCurrency(o.deliveryCharge)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink/50">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
