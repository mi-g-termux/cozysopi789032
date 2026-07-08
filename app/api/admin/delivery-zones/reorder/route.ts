import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ ids: z.array(z.string()) });

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION();

  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.deliveryZone.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  return ok({ reordered: true });
}
