import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkCoupon, computeDiscount } from "@/lib/coupon";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

// Public endpoint the checkout page calls to validate a promo code and preview
// the discount. Rate-limited to prevent brute-forcing valid codes.
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "coupon", 20, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase().trim() },
  });
  const check = checkCoupon(coupon, parsed.data.subtotal);
  if (!check.ok) return Errors.VALIDATION(check.reason);

  const discount = computeDiscount(coupon!, parsed.data.subtotal);
  return ok({
    code: coupon!.code,
    type: coupon!.type,
    value: coupon!.value,
    discount,
  });
}
