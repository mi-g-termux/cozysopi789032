import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "./ProductDetail";
import { getSettings } from "@/lib/settings";
import type { ProductDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  let product: ProductDTO | null = null;
  try {
    product = (await prisma.product.findUnique({
      where: { id: params.id },
    })) as ProductDTO | null;
  } catch {
    product = null;
  }
  if (!product || !product.active) notFound();
  const settings = await getSettings();
  return (
    <ProductDetail product={product} reviewsEnabled={settings.reviewsEnabled} />
  );
}
