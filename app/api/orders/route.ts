import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { auth } from "@/lib/auth";

// Customer: own orders only.
export async function GET() {
  const session = await auth();
  if (!session?.user) return Errors.UNAUTHENTICATED();
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  return ok(orders);
}
