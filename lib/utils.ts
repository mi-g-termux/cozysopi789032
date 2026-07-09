import { randomBytes, randomInt } from "crypto";

/** Format a number as currency using the provided symbol. */
export function formatCurrency(amount: number, symbol = "$"): string {
  return `${symbol}${amount.toFixed(2)}`;
}

/** Generate a 6-digit numeric OTP. */
export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

/** Generate a URL-safe random token. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** Generate an array of backup codes for 2FA. */
export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(4).toString("hex").toUpperCase()
  );
}

/** Minutes remaining until a future date (rounded up, min 0). */
export function minutesUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 60000));
}

/** Human readable date. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** Short order reference derived from cuid. */
export function orderRef(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

/**
 * Format a sequential legal invoice number, e.g. formatInvoiceNumber("INV-", 123)
 * => "INV-000123". Used for tax-compliant invoices in regulated markets.
 */
export function formatInvoiceNumber(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(6, "0")}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
