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
  const [refunding, setRefunding] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success(
        status === "cancelled"
          ? "Order cancelled \u2014 items restocked"
          : "Order updated",
      );
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  async function refund(order: OrderDTO, partial: boolean) {
    const remaining = order.total - order.refundedAmount;
    let amount: number | undefined;
    if (partial) {
      const input = window.prompt(
        `Refund amount (max ${formatCurrency(remaining)}):`,
        remaining.toFixed(2),
      );
      if (input == null) return;
      amount = Number(input);
      if (!Number.isFinite(amount) || amount <= 0)
        return toast.error("Enter a valid amount.");
    } else if (
      !window.confirm(
        `Refund ${formatCurrency(remaining)} for order ${orderRef(order.id)}?`,
      )
    ) {
      return;
    }
    setRefunding(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(amount != null ? { amount } : {}),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((os) =>
          os.map((o) => (o.id === order.id ? { ...o, ...json.data } : o)),
        );
        toast.success("Refund processed");
      } else {
        toast.error(json.error ?? "Refund failed.");
      }
    } catch {
      toast.error("Refund failed.");
    } finally {
      setRefunding(null);
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
              <th className="p-3">Invoice</th>
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
                  <td className="p-3 text-ink/60">
                    {o.invoiceNumber != null ? o.invoiceNumber : "\u2014"}
                  </td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3">{o.deliveryArea}</td>
                  <td className="p-3 capitalize">
                    {o.paymentMethod} · {o.paymentStatus}
                    {o.refundStatus && o.refundStatus !== "none" ? (
                      <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                        {o.refundStatus} refund
                      </span>
                    ) : null}
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
                    <td colSpan={8} className="p-4">
                      <div className="space-y-1 text-sm">
                        {o.items.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>
                              {it.product.name} × {it.quantity}
                            </span>
                            <span>
                              {formatCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="mt-2 flex justify-between border-t border-secondary/40 pt-2">
                          <span>Subtotal</span>
                          <span>{formatCurrency(o.subtotal)}</span>
                        </div>
                        {o.discount > 0 ? (
                          <div className="flex justify-between text-olive">
                            <span>
                              Discount{o.couponCode ? ` (${o.couponCode})` : ""}
                            </span>
                            <span>-{formatCurrency(o.discount)}</span>
                          </div>
                        ) : null}
                        {o.tax > 0 ? (
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{formatCurrency(o.tax)}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span>{formatCurrency(o.deliveryCharge)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(o.total)}</span>
                        </div>
                        {o.refundedAmount > 0 ? (
                          <div className="flex justify-between text-amber-700">
                            <span>Refunded</span>
                            <span>-{formatCurrency(o.refundedAmount)}</span>
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={`/api/admin/orders/${o.id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                          >
                            Download invoice
                          </a>
                          {o.paymentStatus !== "refunded" &&
                          (o.paymentStatus === "paid" ||
                            o.refundedAmount > 0) ? (
                            <>
                              <button
                                disabled={refunding === o.id}
                                onClick={() => refund(o, false)}
                                className="rounded-lg border border-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                              >
                                {refunding === o.id
                                  ? "Processing..."
                                  : "Refund full"}
                              </button>
                              <button
                                disabled={refunding === o.id}
                                onClick={() => refund(o, true)}
                                className="rounded-lg border border-secondary px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-secondary/20 disabled:opacity-50"
                              >
                                Partial refund
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-ink/50">
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
