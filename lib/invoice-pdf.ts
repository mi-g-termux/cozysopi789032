import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { InvoiceData } from "@/lib/invoice";

const DARK = rgb(0.106, 0.106, 0.106);
const MUTED = rgb(0.54, 0.54, 0.54);
const HAIR = rgb(0.94, 0.93, 0.89);
const PANEL = rgb(0.98, 0.965, 0.933);
const WHITE = rgb(1, 1, 1);
const DEFAULT_ACCENT = rgb(0.91, 0.631, 0.227); // #e8a13a

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

/** Parse a #rrggbb string into a pdf-lib rgb colour, or fall back to accent. */
function hexColor(hex?: string) {
  if (!hex) return DEFAULT_ACCENT;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return DEFAULT_ACCENT;
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Render an order invoice as a real binary PDF (Uint8Array). */
export async function invoicePdfBytes(d: InvoiceData): Promise<Uint8Array> {
  const accent = hexColor(d.accent);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const left = 56;
  const right = width - 56;
  let y = height;

  const sym = curSym(d.currencySymbol);
  const money = (n: number) => `${sym}${n.toFixed(2)}`;

  const drawAt = (
    s: string,
    x: number,
    yy: number,
    size: number,
    f = font,
    color = DARK,
  ) => page.drawText(safe(s), { x, y: yy, size, font: f, color });

  const draw = (s: string, x: number, size: number, f = font, color = DARK) =>
    drawAt(s, x, y, size, f, color);

  const drawRightAt = (
    s: string,
    xRight: number,
    size: number,
    f = font,
    color = DARK,
  ) => {
    const t = safe(s);
    const w = f.widthOfTextAtSize(t, size);
    page.drawText(t, { x: xRight - w, y, size, font: f, color });
  };

  const drawRight = (s: string, size: number, f = font, color = DARK) =>
    drawRightAt(s, right, size, f, color);

  const rule = (thickness = 1, color = HAIR) =>
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness,
      color,
    });

  const fit = (s: string, size: number, max: number) => {
    const base = safe(s);
    let t = base;
    while (t.length > 4 && font.widthOfTextAtSize(t, size) > max) {
      t = t.slice(0, -2);
    }
    return t === base ? t : `${t}\u2026`;
  };

  // ---- Coloured header band ----
  const bandH = 96;
  page.drawRectangle({
    x: 0,
    y: height - bandH,
    width,
    height: bandH,
    color: accent,
  });
  // Brand badge (initial) + name
  const badge = 40;
  const badgeY = height - bandH / 2 - badge / 2;
  page.drawRectangle({
    x: left,
    y: badgeY,
    width: badge,
    height: badge,
    color: rgb(1, 1, 1),
    opacity: 0.22,
  });
  const initial = (d.storeName || "S").trim().charAt(0).toUpperCase();
  drawAt(initial, left + 13, badgeY + 12, 20, bold, WHITE);
  drawAt(
    d.storeName,
    left + badge + 14,
    height - bandH / 2 - 4,
    20,
    bold,
    WHITE,
  );
  // INVOICE label + number (right)
  {
    const t = "INVOICE";
    const w = bold.widthOfTextAtSize(t, 22);
    page.drawText(t, {
      x: right - w,
      y: height - 44,
      size: 22,
      font: bold,
      color: WHITE,
    });
    if (d.invoiceNumber) {
      const n = safe(d.invoiceNumber);
      const nw = font.widthOfTextAtSize(n, 12);
      page.drawText(n, {
        x: right - nw,
        y: height - 62,
        size: 12,
        font,
        color: WHITE,
      });
    }
  }

  y = height - bandH - 34;

  // ---- Meta row: billed to / order + date ----
  draw("BILLED TO", left, 8, bold, MUTED);
  drawRightAt("ORDER", right, 8, bold, MUTED);
  y -= 14;
  draw(d.email, left, 12, bold, DARK);
  drawRight(d.ref, 12, bold, DARK);
  y -= 14;
  draw(d.storeEmail, left, 9, font, MUTED);
  drawRight(d.date, 9, font, MUTED);
  y -= 24;

  // ---- Item table ----
  const qtyX = right - 210;
  const unitX = right - 105;
  const rowH = 22;

  // header background
  page.drawRectangle({
    x: left,
    y: y - 6,
    width: right - left,
    height: 22,
    color: PANEL,
  });
  draw("ITEM", left + 10, 9, bold, MUTED);
  draw("QTY", qtyX, 9, bold, MUTED);
  drawRightAt("UNIT PRICE", unitX, 9, bold, MUTED);
  drawRightAt("AMOUNT", right - 10, 9, bold, MUTED);
  y -= 22;

  for (const it of d.items) {
    draw(fit(it.name, 11, qtyX - left - 18), left + 10, 11, font, DARK);
    draw(String(it.quantity), qtyX, 11, font, MUTED);
    drawRightAt(money(it.price), unitX, 11, font, MUTED);
    drawRightAt(money(it.price * it.quantity), right - 10, 11, bold, DARK);
    y -= 12;
    rule(0.5, HAIR);
    y -= rowH - 12;
  }
  y -= 8;

  // ---- Totals (right aligned) ----
  const labelX = right - 200;
  const totalRow = (
    label: string,
    val: string,
    f = font,
    color = MUTED,
    size = 11,
  ) => {
    page.drawText(safe(label), { x: labelX, y, size, font: f, color });
    drawRightAt(val, right - 10, size, f, color === MUTED ? DARK : color);
    y -= 18;
  };
  totalRow("Subtotal", money(d.subtotal));
  if (d.discount && d.discount > 0)
    totalRow("Discount", `-${money(d.discount)}`);
  if (d.tax && d.tax > 0) totalRow(d.taxLabel ?? "Tax", money(d.tax));
  totalRow("Delivery", money(d.deliveryCharge));
  y -= 2;
  // accent divider above total
  page.drawLine({
    start: { x: labelX, y: y + 6 },
    end: { x: right - 10, y: y + 6 },
    thickness: 2,
    color: accent,
  });
  y -= 10;
  page.drawText("Total", { x: labelX, y, size: 14, font: bold, color: DARK });
  drawRightAt(money(d.total), right - 10, 14, bold, DARK);
  y -= 34;

  // ---- Address + payment panels ----
  const payMethod =
    d.paymentMethod.toLowerCase() === "cod"
      ? "Cash on delivery"
      : d.paymentMethod.toLowerCase() === "stripe"
        ? "Card (Stripe)"
        : d.paymentMethod.toLowerCase() === "paypal"
          ? "PayPal"
          : d.paymentMethod;

  const panelTop = y;
  const panelH = 96;
  const gap = 14;
  const panelW = (right - left - gap) / 2;
  page.drawRectangle({
    x: left,
    y: panelTop - panelH,
    width: panelW,
    height: panelH,
    color: PANEL,
  });
  page.drawRectangle({
    x: left + panelW + gap,
    y: panelTop - panelH,
    width: panelW,
    height: panelH,
    color: PANEL,
  });

  const a = d.address;
  const addrLines = [
    a.fullName,
    a.phone,
    `${a.street}, ${a.area}, ${a.city}${a.postalCode ? ` ${a.postalCode}` : ""}`,
  ].filter((ln) => {
    const c = (ln ?? "").trim();
    return c && c !== ",  ," && c !== ", ,";
  });

  const lx = left + 12;
  let ly = panelTop - 22;
  drawAt("DELIVER TO", lx, ly, 8, bold, MUTED);
  ly -= 16;
  for (const ln of addrLines) {
    drawAt(fit(ln, 10, panelW - 24), lx, ly, 10, font, DARK);
    ly -= 14;
  }

  const rx = left + panelW + gap + 12;
  let ry = panelTop - 22;
  drawAt("PAYMENT", rx, ry, 8, bold, MUTED);
  ry -= 16;
  drawAt(payMethod, rx, ry, 11, bold, DARK);
  ry -= 15;
  drawAt(`Status: ${d.paymentStatus}`, rx, ry, 10, font, MUTED);

  // ---- Footer ----
  page.drawText(safe(`${d.storeName} - Thank you for your order!`), {
    x: left,
    y: 44,
    size: 9,
    font,
    color: MUTED,
  });

  return await pdf.save();
}
