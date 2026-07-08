import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(featured ? { featured: featured === "true" } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(products);
  } catch {
    return Errors.SERVER();
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const product = await prisma.product.create({ data: parsed.data });
  // Live update: new product appears on the storefront instantly, everywhere.
  await broadcast(EVENTS.PRODUCT_UPDATED, { id: product.id });
  return ok(product, 201);
}
