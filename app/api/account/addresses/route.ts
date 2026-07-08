import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Errors.UNAUTHENTICATED();
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });
  return ok(addresses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Errors.UNAUTHENTICATED();

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id },
  });
  return ok(address, 201);
}
