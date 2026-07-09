import { prisma } from "@/lib/prisma";
import { OrdersAdmin } from "./OrdersAdmin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  const serial = orders.map((o) => ({
    id: o.id,
    email: o.email,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    subtotal: o.subtotal,
    discount: o.discount,
    couponCode: o.couponCode,
    tax: o.tax,
    deliveryCharge: o.deliveryCharge,
    total: o.total,
    deliveryArea: o.deliveryArea,
    invoiceNumber: o.invoiceNumber,
    refundStatus: o.refundStatus,
    refundedAmount: o.refundedAmount,
    paymentRef: o.paymentRef,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it) => ({
      id: it.id,
      quantity: it.quantity,
      price: it.price,
      product: { name: it.product.name, images: it.product.images },
    })),
  }));
  return <OrdersAdmin initial={serial} />;
}
