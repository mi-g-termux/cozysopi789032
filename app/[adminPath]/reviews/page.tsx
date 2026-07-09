import { prisma } from "@/lib/prisma";
import { ReviewsAdmin } from "./ReviewsAdmin";
import type { ReviewDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const rows = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true } } },
  });
  const initial: ReviewDTO[] = rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.product?.name ?? "(deleted)",
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
  }));
  return <ReviewsAdmin initial={initial} />;
}
