import { prisma } from "@/lib/prisma";
import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { siteContentSchema } from "@/lib/validations";
import { broadcast, EVENTS } from "@/lib/pusher";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  return ok(await getSettings());
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();

  const body = await req.json().catch(() => null);
  const parsed = siteContentSchema.safeParse(body);
  if (!parsed.success)
    return Errors.VALIDATION(parsed.error.issues[0]?.message);

  const { heroSlides, faqs, ...rest } = parsed.data;
  const data = {
    ...rest,
    heroSlides: heroSlides ?? [],
    faqs: faqs ?? [],
  };

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  // Storefront + admin both listen for this and live-refresh.
  await broadcast(EVENTS.SETTINGS_UPDATED, { id: settings.id });
  return ok(settings);
}
