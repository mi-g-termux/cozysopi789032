import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { InvoiceData } from "@/lib/invoice";

const BLUE = rgb(0.42, 0.714, 0.839);
const DARK = rgb(0.067, 0.067, 0.067);
const MUTED = rgb(0.53, 0.53, 0.53);
const HAIR = rgb(0.9, 0.9, 0.9);

// Currency symbols the standard Helvetica font cannot encode -> ASCII fallback.
const CUR_MAP: Record<string, string> = {
  "\u09F3": "Tk", // Bangladeshi taka
  "\u20B9": "Rs", // Indian rupee
  "\u20A8": "Rs",
  "\u20A9": "KRW",
  "\u20A6": "NGN",
  "\u20B1": "PHP",
  "\u0E3F": "THB",
  "\u20AB": "VND",
  "\u20B4": "UAH",
  "\u20AA": "ILS",
  "\u20BA": "TRY",
};

// Higher-codepoint characters that WinAnsi (Helvetica) *can* render.
const WINANSI_EXTRA = new Set(
  "\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178".split(
    "",
  ),
);

function curSym(sym: string): string {
  return CUR_MAP[sym] ? `${CUR_MAP[sym]} ` : sym;
}

/** Replace characters the standard font cannot encode so save() never throws. */
function safe(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    if (code <= 255 || WINANSI_EXTRA.has(ch)) out += ch;
    else if (CUR_MAP[ch]) out += CUR_MAP[ch];
    else out += "?";
  }
  return out;
}

/** Render an order invoice as a real binary PDF (Uint8Array). */
export async function invoicePdfBytes(d: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const left = 56;
  const right = width - 56;
  let y = height - 64;

  const sym = curSym(d.currencySymbol);
  const money = (n: number) => `${sym}${n.toFixed(2)}`;

  const draw = (s: string, x: number, size: number, f = font, color = DARK) =>
    page.drawText(safe(s), { x, y, size, font: f, color });

  const drawRight = (s: string, size: number, f = font, color = DARK) => {
    const t = safe(s);
    const w = f.widthOfTextAtSize(t, size);
    page.drawText(t, { x: right - w, y, size, font: f, color });
  };

  const rule = (thickness = 1, color = HAIR) =>
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness,
      color,
    });

  // Truncate long product names so the amount column stays aligned.
  const fit = (s: string, size: number, max: number) => {
    const base = safe(s);
    let t = base;
    while (t.length > 4 && font.widthOfTextAtSize(t, size) > max) {
      t = t.slice(0, -2);
    }
    return t === base ? t : `${t}\u2026`;
  };

  // Header
  draw(d.storeName, left, 22, bold, BLUE);
  drawRight("INVOICE", 20, bold, DARK);
  y -= 18;
  draw(d.storeEmail, left, 10, font, MUTED);
  if (d.invoiceNumber) {
    drawRight(d.invoiceNumber, 12, bold, DARK);
    y -= 14;
    drawRight(`Order ${d.ref}`, 10, font, MUTED);
  } else {
    drawRight(d.ref, 11, font, DARK);
  }
  y -= 14;
  drawRight(d.date, 10, font, MUTED);
  y -= 26;

  draw(`Billed to: ${d.email}`, left, 11, font, MUTED);
  y -= 16;
  rule();
  y -= 22;

  // Items
  for (const it of d.items) {
    const label = `${it.name}  x ${it.quantity}`;
    draw(fit(label, 11, right - left - 110), left, 11, font, DARK);
    drawRight(money(it.price * it.quantity), 11, font, DARK);
    y -= 10;
    rule(0.5, rgb(0.93, 0.93, 0.93));
    y -= 16;
  }
  y -= 6;

  // Totals
  const labelX = right - 200;
  const totalRow = (
    label: string,
    val: string,
    f = font,
    color = DARK,
    size = 11,
  ) => {
    page.drawText(safe(label), { x: labelX, y, size, font: f, color });
    drawRight(val, size, f, color);
    y -= 18;
  };
  totalRow("Subtotal", money(d.subtotal), font, MUTED);
  if (d.discount && d.discount > 0)
    totalRow("Discount", `-${money(d.discount)}`, font, MUTED);
  if (d.tax && d.tax > 0)
    totalRow(d.taxLabel ?? "Tax", money(d.tax), font, MUTED);
  totalRow("Delivery", money(d.deliveryCharge), font, MUTED);
  y -= 2;
  totalRow("Total", money(d.total), bold, DARK, 14);

  // Delivery address
  y -= 20;
  draw("Deliver to", left, 11, bold, DARK);
  y -= 16;
  const a = d.address;
  const addrLines = [
    a.fullName,
    a.phone,
    `${a.street}, ${a.area}, ${a.city}${a.postalCode ? ` ${a.postalCode}` : ""}`,
  ];
  for (const ln of addrLines) {
    const clean = (ln ?? "").trim();
    if (clean && clean !== ",  ," && clean !== ", ,") {
      draw(ln, left, 10, font, MUTED);
      y -= 14;
    }
  }
  y -= 8;
  draw(
    `Payment: ${d.paymentMethod} - ${d.paymentStatus}`,
    left,
    10,
    font,
    MUTED,
  );

  // Footer
  page.drawText(safe(`${d.storeName} - Thank you for your order!`), {
    x: left,
    y: 48,
    size: 9,
    font,
    color: MUTED,
  });

  return await pdf.save();
}
