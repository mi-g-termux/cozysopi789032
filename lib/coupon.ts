// Coupon / promo-code helpers shared by the checkout route and the public
// validation endpoint so the discount math stays identical on both sides.

export type CouponLike = {
  code: string;
  type: string; // "percent" | "fixed"
  value: number;
  active: boolean;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | string | null;
};

/** Discount amount a coupon applies to a subtotal (never exceeds subtotal). */
export function computeDiscount(coupon: CouponLike, subtotal: number): number {
  const raw =
    coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
  return Number(Math.min(Math.max(raw, 0), subtotal).toFixed(2));
}

/**
 * Validate a coupon against a subtotal. Returns { ok:false, reason } when the
 * coupon cannot be applied so the caller can surface a friendly message.
 */
export function checkCoupon(
  coupon: CouponLike | null | undefined,
  subtotal: number,
): { ok: boolean; reason?: string } {
  if (!coupon || !coupon.active)
    return { ok: false, reason: "Invalid or inactive coupon code." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { ok: false, reason: "This coupon has expired." };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
    return { ok: false, reason: "This coupon has reached its usage limit." };
  if (subtotal < coupon.minSubtotal)
    return {
      ok: false,
      reason: "Your subtotal is below the minimum for this coupon.",
    };
  return { ok: true };
}
