import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validations";

// Admin list of all coupons.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return ok(coupons);
}

// Create a coupon.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const body = await req.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing)
    return Errors.CONFLICT("A coupon with that code already exists.");

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      active: parsed.data.active,
      minSubtotal: parsed.data.minSubtotal,
      maxUses: parsed.data.maxUses ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  return ok(coupon, 201);
}
