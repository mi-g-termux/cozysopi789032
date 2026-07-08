import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";
import { broadcast, EVENTS } from "@/lib/pusher";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Errors.NOT_FOUND("Product not found.");
  return ok(product);
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const product = await prisma.product.update({
    where: { id: params.id },
    data: parsed.data,
  });
  // Live update: edits (price, name, images, stock, visibility) push everywhere.
  await broadcast(EVENTS.PRODUCT_UPDATED, {
    id: product.id,
    stock: product.stock,
  });
  await broadcast(EVENTS.STOCK_UPDATE, {
    id: product.id,
    stock: product.stock,
  });
  return ok(product);
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Errors.NOT_FOUND("Product not found.");
  await Promise.all(
    product.images.map((url) => deleteImage(url).catch(() => null)),
  );
  await prisma.product.delete({ where: { id: params.id } });
  // Live update: product disappears from every open storefront instantly.
  await broadcast(EVENTS.PRODUCT_DELETED, { id: params.id });
  return ok({ deleted: true });
}
