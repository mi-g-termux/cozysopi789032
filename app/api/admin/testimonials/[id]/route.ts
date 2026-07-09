import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  role: z.string().max(120).optional(),
  quote: z.string().min(3).max(600).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

// Update a testimonial (edit text, toggle active, reorder).
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  const row = await prisma.testimonial.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return ok(row);
}

// Delete a testimonial.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  await prisma.testimonial.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
