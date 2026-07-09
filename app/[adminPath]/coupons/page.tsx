import { prisma } from "@/lib/prisma";
import { CouponsAdmin } from "./CouponsAdmin";
import type { CouponDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const initial: CouponDTO[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    active: c.active,
    minSubtotal: c.minSubtotal,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));
  return <CouponsAdmin initial={initial} />;
}
