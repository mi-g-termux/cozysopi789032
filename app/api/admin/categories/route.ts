import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { broadcast, EVENTS } from "@/lib/pusher";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return ok(categories);
  } catch {
    return Errors.SERVER();
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const slug = slugify(parsed.data.name);
  if (!slug) return Errors.VALIDATION("Please enter a valid category name.");

  try {
    const category = await prisma.category.create({
      data: { ...parsed.data, slug },
    });
    await broadcast(EVENTS.SETTINGS_UPDATED, { id: category.id });
    return ok(category, 201);
  } catch {
    return Errors.VALIDATION("A category with that name already exists.");
  }
}
