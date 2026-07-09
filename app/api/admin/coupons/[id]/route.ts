import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.number().positive().optional(),
  active: z.boolean().optional(),
  minSubtotal: z.number().min(0).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

// Update a coupon (toggle active, change value, limits, expiry).
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  const { expiresAt, ...rest } = parsed.data;
  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(expiresAt !== undefined
        ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
        : {}),
    },
  });
  return ok(coupon);
}

// Delete a coupon.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  await prisma.coupon.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
