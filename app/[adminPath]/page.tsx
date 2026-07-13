import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, orderRef } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// An order counts toward revenue/profit once money is in: either the payment
// gateway marked it "paid", OR it's a "delivered" order (COD cash collected).
// Cancelled and refunded orders are excluded.
const EARNED: Prisma.OrderWhereInput = {
  status: { not: "cancelled" },
  paymentStatus: { not: "refunded" },
  OR: [{ paymentStatus: "paid" }, { status: "delivered" }],
};

export default async function AdminDashboard() {
  const [
    orders,
    productCount,
    customerCount,
    revenueAgg,
    paidItems,
    settings,
    recent,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: EARNED,
    }),
    prisma.orderItem.findMany({
      where: { order: EARNED },
      select: { price: true, quantity: true, costPrice: true },
    }),
    getSettings(),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
  ]);

  const sym = settings.currencySymbol || "$";
  const revenue = revenueAgg._sum.total ?? 0;
  const profit = paidItems.reduce(
    (acc, i) => acc + (i.price - i.costPrice) * i.quantity,
    0,
  );

  const cards = [
    { label: "Total orders", value: orders },
    { label: "Products", value: productCount },
    { label: "Customers", value: customerCount },
    { label: "Revenue", value: formatCurrency(revenue, sym) },
    { label: "Total profit", value: formatCurrency(profit, sym) },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-ink/60">{c.label}</p>
            <p className="mt-1 font-heading text-3xl">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-2xl">Recent orders</h2>
      <div className="card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-secondary/40">
                <td className="p-3 font-medium">{orderRef(o.id)}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3">{formatCurrency(o.total)}</td>
                <td className="p-3">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
            {recent.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-ink/50" colSpan={5}>
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
