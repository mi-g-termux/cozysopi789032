import { prisma } from "@/lib/prisma";
import { ShopClient } from "./ShopClient";
import type { ProductDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: ProductDTO[] = [];
  try {
    products = (await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    })) as ProductDTO[];
  } catch {
    products = [];
  }
  const categories = Array.from(new Set(products.map((p) => p.category)));
  return <ShopClient products={products} categories={categories} />;
}
