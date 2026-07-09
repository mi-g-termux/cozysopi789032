import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { reviewSchema } from "@/lib/validations";
import { getSettings } from "@/lib/settings";
import { enforceRateLimit } from "@/lib/rate-limit";
import { broadcast, EVENTS } from "@/lib/pusher";
import { auth } from "@/lib/auth";

// Public list of APPROVED reviews for a product.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return Errors.VALIDATION("Missing productId.");
  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  const count = reviews.length;
  const average =
    count > 0
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(2))
      : 0;
  return ok({ reviews, count, average });
}

// Customers submit a review (rate-limited). Auto-approves when the admin
// enables it, otherwise it waits for moderation.
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "review", 5, 60_000);
  if (limited) return limited;

  const settings = await getSettings();
  if (!settings.reviewsEnabled)
    return Errors.VALIDATION("Reviews are currently disabled.");

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) return Errors.NOT_FOUND("Product not found.");

  const session = await auth();
  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session?.user?.id ?? null,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      approved: settings.reviewAutoApprove,
    },
  });

  if (review.approved)
    await broadcast(EVENTS.PRODUCT_UPDATED, { id: product.id });

  return ok(
    {
      review,
      pending: !review.approved,
      message: review.approved
        ? "Thanks for your review!"
        : "Thanks! Your review will appear once approved.",
    },
    201,
  );
}
