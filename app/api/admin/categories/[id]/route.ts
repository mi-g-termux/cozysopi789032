import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { broadcast, EVENTS } from "@/lib/pusher";

type Params = { params: { id: string } };

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) data.slug = slugify(parsed.data.name);

  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    });
    await broadcast(EVENTS.SETTINGS_UPDATED, { id: category.id });
    return ok(category);
  } catch {
    return Errors.VALIDATION("Could not update category.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  try {
    await prisma.category.delete({ where: { id: params.id } });
    await broadcast(EVENTS.SETTINGS_UPDATED, { id: params.id });
    return ok({ deleted: true });
  } catch {
    return Errors.VALIDATION("Could not delete category.");
  }
}
