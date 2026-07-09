import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// Admin list of ALL reviews (pending + approved) with product name.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true } } },
  });
  return ok(
    reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product?.name ?? "(deleted)",
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      approved: r.approved,
      createdAt: r.createdAt.toISOString(),
    })),
  );
}
