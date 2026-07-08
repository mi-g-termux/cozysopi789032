import { notFound } from "next/navigation";

// Always render fresh so product edits appear live via router.refresh().
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "./ProductDetail";
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
  return <ProductDetail product={product} />;
}
