import { prisma } from "@/lib/prisma";
import { ProductsAdmin } from "./ProductsAdmin";
import type { ProductDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = (await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  })) as ProductDTO[];
  return <ProductsAdmin initial={products} />;
}
