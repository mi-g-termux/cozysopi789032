import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validations";

// Admin list of all testimonials (any status), ordered for display.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return ok(rows);
}

// Create a testimonial shown in the "What people are saying" section.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const row = await prisma.testimonial.create({ data: parsed.data });
  return ok(row, 201);
}
