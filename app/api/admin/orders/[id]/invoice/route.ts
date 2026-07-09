import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { invoicePdfBytes } from "@/lib/invoice-pdf";
import { orderRef, formatDate, formatInvoiceNumber } from "@/lib/utils";

/** Binary PDF invoice for an order (admin only). Downloads as a .pdf file. */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return new Response("Not found", { status: 404 });

  const s = await getSettings();
  const address = (order.address ?? {}) as Record<string, string>;
  const ref = orderRef(order.id);

  const bytes = await invoicePdfBytes({
    ref,
    invoiceNumber:
      order.invoiceNumber != null
        ? formatInvoiceNumber(s.invoicePrefix, order.invoiceNumber)
        : undefined,
    email: order.email,
    date: formatDate(order.createdAt),
    items: order.items.map((it) => ({
      name: it.product.name,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    taxLabel: s.taxLabel,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    address: {
      fullName: address.fullName ?? "",
      phone: address.phone ?? "",
      street: address.street ?? "",
      area: address.area ?? "",
      city: address.city ?? "",
      postalCode: address.postalCode,
    },
    storeName: s.storeName,
    storeEmail: s.storeEmail,
    currencySymbol: s.currencySymbol,
  });

  const fileName = `invoice-${ref.replace(/[^A-Za-z0-9]/g, "")}.pdf`;
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
