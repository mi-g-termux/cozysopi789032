import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/lib/validations";

type Params = { params: { id: string } };

async function owns(userId: string, id: string) {
  const a = await prisma.address.findUnique({ where: { id } });
  return a && a.userId === userId ? a : null;
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return Errors.UNAUTHENTICATED();
  if (!(await owns(session.user.id, params.id))) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return ok(address);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return Errors.UNAUTHENTICATED();
  if (!(await owns(session.user.id, params.id))) return Errors.FORBIDDEN();
  await prisma.address.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
