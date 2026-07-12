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
  /** Optional brand accent (hex). Defaults to a warm cream-shop tone. */
  accent?: string;
};

const DEFAULT_ACCENT = "#e8a13a";
const INK = "#1b1b1b";

function money(sym: string, n: number): string {
  return `${sym}${n.toFixed(2)}`;
}

export function paymentLabel(method: string): string {
  const m = method.toLowerCase();
  if (m === "cod") return "Cash on delivery";
  if (m === "stripe") return "Card (Stripe)";
  if (m === "paypal") return "PayPal";
  return method;
}

function statusPill(status: string, accent: string): string {
  const s = status.toLowerCase();
  const paid = s === "paid";
  const bg = paid ? "#e7f6ec" : "#fdf1e3";
  const fg = paid ? "#1f8a4c" : accent;
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${bg};color:${fg};font-size:12px;font-weight:700;text-transform:capitalize">${status}</span>`;
}

/** Reusable invoice fragment (used inside emails and the printable page). */
export function invoiceBody(d: InvoiceData): string {
  const accent = d.accent || DEFAULT_ACCENT;
  const th =
    "padding:10px 12px;background:#faf6ee;font-size:11px;color:#8a8a8a;font-weight:700;text-transform:uppercase;letter-spacing:.04em";
  const td = "padding:11px 12px;border-bottom:1px solid #f0ece3;font-size:14px";

  const rows = d.items
    .map(
      (it) => `
      <tr>
        <td style="${td};color:${INK}">${it.name}</td>
        <td style="${td};text-align:center;color:#666">${it.quantity}</td>
        <td style="${td};text-align:right;color:#666">${money(d.currencySymbol, it.price)}</td>
        <td style="${td};text-align:right;color:${INK};font-weight:600">${money(d.currencySymbol, it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const sumRow = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:5px 0;color:${strong ? INK : "#666"};font-size:${strong ? "16px" : "14px"};font-weight:${strong ? "700" : "400"}">${label}</td>
      <td style="padding:5px 0;text-align:right;color:${INK};font-size:${strong ? "16px" : "14px"};font-weight:${strong ? "700" : "500"}">${value}</td>
    </tr>`;

  const discountRow =
    d.discount && d.discount > 0
      ? sumRow("Discount", `-${money(d.currencySymbol, d.discount)}`)
      : "";
  const taxRow =
    d.tax && d.tax > 0
      ? sumRow(d.taxLabel ?? "Tax", money(d.currencySymbol, d.tax))
      : "";

  const postal = d.address.postalCode ? " " + d.address.postalCode : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 20px;border:1px solid #f0ece3;border-radius:12px;overflow:hidden">
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
      </tbody>
    </table>

    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="vertical-align:top;width:55%;padding-right:16px"></td>
        <td style="vertical-align:top;width:45%">
          <table style="width:100%;border-collapse:collapse">
            ${sumRow("Subtotal", money(d.currencySymbol, d.subtotal))}
            ${discountRow}
            ${taxRow}
            ${sumRow("Delivery", money(d.currencySymbol, d.deliveryCharge))}
            <tr><td colspan="2" style="padding:6px 0"><div style="border-top:2px solid ${accent}"></div></td></tr>
            ${sumRow("Total", money(d.currencySymbol, d.total), true)}
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:24px">
      <tr>
        <td style="vertical-align:top;width:50%;padding:16px;background:#faf6ee;border-radius:12px;font-size:13px;color:#555;line-height:1.7">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#9a9a9a;font-weight:700;margin-bottom:6px">Deliver to</div>
          <strong style="color:${INK}">${d.address.fullName}</strong><br/>
          ${d.address.phone}<br/>
          ${d.address.street}, ${d.address.area}, ${d.address.city}${postal}
        </td>
        <td style="width:12px"></td>
        <td style="vertical-align:top;width:50%;padding:16px;background:#faf6ee;border-radius:12px;font-size:13px;color:#555;line-height:1.7">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#9a9a9a;font-weight:700;margin-bottom:6px">Payment</div>
          <strong style="color:${INK}">${paymentLabel(d.paymentMethod)}</strong><br/>
          ${statusPill(d.paymentStatus, accent)}
        </td>
      </tr>
    </table>`;
}

/** Full standalone printable HTML invoice (admin download / print to PDF). */
export function invoiceDocument(d: InvoiceData): string {
  const accent = d.accent || DEFAULT_ACCENT;
  const initial = (d.storeName || "S").trim().charAt(0).toUpperCase();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Invoice ${d.invoiceNumber ?? d.ref}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Inter,-apple-system,Segoe UI,Arial,sans-serif;color:${INK};background:#f2ede3;padding:32px;margin:0}
  .sheet{max-width:720px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.08)}
  .band{background:${accent};padding:28px 40px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:16px}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}
  .brandname{font-size:24px;font-weight:800;letter-spacing:.5px}
  .invtag{text-align:right}
  .invtag h2{margin:0;font-size:22px;letter-spacing:3px;font-weight:800}
  .invtag .num{font-size:13px;opacity:.95;margin-top:2px;font-weight:600}
  .body{padding:32px 40px 40px}
  .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;font-size:13px;color:#666}
  .meta strong{color:${INK}}
  .muted{color:#8a8a8a}
  .print{margin-top:28px;background:${accent};color:#fff;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600}
  @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0}.print{display:none}}
  @media (max-width:520px){.band,.body{padding-left:20px;padding-right:20px}}
</style>
</head>
<body>
  <div class="sheet">
    <div class="band">
      <div class="brand">
        <div class="logo">${initial}</div>
        <div class="brandname">${d.storeName}</div>
      </div>
      <div class="invtag">
        <h2>INVOICE</h2>
        ${d.invoiceNumber ? `<div class="num">${d.invoiceNumber}</div>` : ""}
      </div>
    </div>
    <div class="body">
      <div class="meta">
        <div>
          <div class="muted">Billed to</div>
          <strong>${d.email}</strong>
        </div>
        <div style="text-align:right">
          <div class="muted">Order ${d.ref}</div>
          <strong>${d.date}</strong><br/>
          <span class="muted">${d.storeEmail}</span>
        </div>
      </div>
      ${invoiceBody(d)}
      <button class="print" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;
}
