export type InvoiceItem = { name: string; quantity: number; price: number };

export type InvoiceAddress = {
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  postalCode?: string;
};

export type InvoiceData = {
  ref: string;
  invoiceNumber?: string;
  email: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  taxLabel?: string;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  address: InvoiceAddress;
  storeName: string;
  storeEmail: string;
  currencySymbol: string;
};

function money(sym: string, n: number): string {
  return `${sym}${n.toFixed(2)}`;
}

function paymentLabel(method: string): string {
  const m = method.toLowerCase();
  if (m === "cod") return "Cash on delivery";
  if (m === "stripe") return "Card (Stripe)";
  if (m === "paypal") return "PayPal";
  return method;
}

/** Reusable invoice fragment (used inside emails and the printable page). */
export function invoiceBody(d: InvoiceData): string {
  const th =
    "padding:6px 0;border-bottom:2px solid #ddd;font-size:12px;color:#888;font-weight:600";
  const td = "padding:9px 0;border-bottom:1px solid #eee;font-size:14px";

  const rows = d.items
    .map(
      (it) => `
      <tr>
        <td style="${td}">${it.name}</td>
        <td style="${td};text-align:center">${it.quantity}</td>
        <td style="${td};text-align:right">${money(d.currencySymbol, it.price)}</td>
        <td style="${td};text-align:right">${money(d.currencySymbol, it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const totalRow = (label: string, value: string, strong = false) => `
    <tr>
      <td colspan="3" style="padding:4px 0;text-align:right;color:#555;${strong ? "font-weight:700;font-size:16px" : ""}">${label}</td>
      <td style="padding:4px 0;text-align:right;${strong ? "font-weight:700;font-size:16px" : ""}">${value}</td>
    </tr>`;

  const discountRow =
    d.discount && d.discount > 0
      ? totalRow("Discount", `-${money(d.currencySymbol, d.discount)}`)
      : "";
  const taxRow =
    d.tax && d.tax > 0
      ? totalRow(d.taxLabel ?? "Tax", money(d.currencySymbol, d.tax))
      : "";

  const postal = d.address.postalCode ? " " + d.address.postalCode : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 16px">
      <thead>
        <tr>
          <th style="${th};text-align:left">Item</th>
          <th style="${th};text-align:center">Qty</th>
          <th style="${th};text-align:right">Unit price</th>
          <th style="${th};text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${totalRow("Subtotal", money(d.currencySymbol, d.subtotal))}
        ${discountRow}
        ${taxRow}
        ${totalRow("Delivery", money(d.currencySymbol, d.deliveryCharge))}
        ${totalRow("Total", money(d.currencySymbol, d.total), true)}
      </tbody>
    </table>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="vertical-align:top;width:50%;font-size:13px;color:#555;line-height:1.6">
          <strong style="color:#111">Deliver to</strong><br/>
          ${d.address.fullName}<br/>
          ${d.address.phone}<br/>
          ${d.address.street}, ${d.address.area}, ${d.address.city}${postal}
        </td>
        <td style="vertical-align:top;width:50%;font-size:13px;color:#555;line-height:1.6">
          <strong style="color:#111">Payment</strong><br/>
          Method: ${paymentLabel(d.paymentMethod)}<br/>
          Status: ${d.paymentStatus}
        </td>
      </tr>
    </table>`;
}

/** Full standalone printable HTML invoice (admin download / print to PDF). */
export function invoiceDocument(d: InvoiceData): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Invoice ${d.invoiceNumber ?? d.ref}</title>
<style>
  body{font-family:Inter,Arial,sans-serif;color:#111;background:#f7f4ec;padding:40px;margin:0}
  .sheet{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 6px 30px rgba(0,0,0,.07)}
  h1{font-family:Georgia,serif;color:#6bb6d6;margin:0;font-size:26px}
  h2{margin:0;font-size:20px;letter-spacing:2px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
  .muted{color:#888}
  .print{margin-top:28px;background:#6bb6d6;color:#fff;border:none;padding:12px 22px;border-radius:10px;cursor:pointer;font-size:14px}
  @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0}.print{display:none}}
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div>
        <h1>${d.storeName}</h1>
        <p class="muted" style="margin:6px 0 0">${d.storeEmail}</p>
      </div>
      <div style="text-align:right">
        <h2>INVOICE</h2>
        ${d.invoiceNumber ? `<p style="margin:6px 0 0;font-weight:700">${d.invoiceNumber}</p>` : ""}
        <p class="muted" style="margin:2px 0 0">Order ${d.ref}</p>
        <p class="muted" style="margin:2px 0 0">${d.date}</p>
      </div>
    </div>
    <p class="muted" style="margin:16px 0 0">Billed to: ${d.email}</p>
    ${invoiceBody(d)}
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;
}
