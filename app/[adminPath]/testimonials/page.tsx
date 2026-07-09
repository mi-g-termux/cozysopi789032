import { prisma } from "@/lib/prisma";
import { TestimonialsAdmin } from "./TestimonialsAdmin";
import type { TestimonialDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const initial: TestimonialDTO[] = rows.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    quote: t.quote,
    sortOrder: t.sortOrder,
    active: t.active,
    createdAt: t.createdAt.toISOString(),
  }));
  return <TestimonialsAdmin initial={initial} />;
}
