import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { broadcast, EVENTS } from "@/lib/pusher";

const schema = z.object({ approved: z.boolean() });

// Approve / unapprove a review.
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();
  const review = await prisma.review.update({
    where: { id: params.id },
    data: { approved: parsed.data.approved },
  });
  await broadcast(EVENTS.PRODUCT_UPDATED, { id: review.productId });
  return ok(review);
}

// Delete a review.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const review = await prisma.review.delete({ where: { id: params.id } });
  await broadcast(EVENTS.PRODUCT_UPDATED, { id: review.productId });
  return ok({ id: params.id });
}
