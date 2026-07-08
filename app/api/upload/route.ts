import { ok, Errors } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";

// Accepts { file: dataUri } and uploads to Cloudinary (shop-products folder).
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Errors.FORBIDDEN();
  if (!cloudinaryConfigured) return Errors.VALIDATION("Cloudinary is not configured.");

  const body = await req.json().catch(() => null);
  const file = body?.file as string | undefined;
  if (!file) return Errors.VALIDATION("No file provided.");

  try {
    const { url } = await uploadImage(file);
    return ok({ url });
  } catch {
    return Errors.SERVER();
  }
}
