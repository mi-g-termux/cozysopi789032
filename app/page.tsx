import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/motion/Primitives";
import type { ProductDTO } from "@/types";

export const dynamic = "force-dynamic";

async function getFeatured(): Promise<ProductDTO[]> {
  try {
    return (await prisma.product.findMany({
      where: { active: true, featured: true },
      take: 8,
      orderBy: { createdAt: "desc" }
    })) as ProductDTO[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl">Featured bites</h2>
            <p className="mt-2 text-ink/60">Our most-loved appetizers, ready to impress.</p>
          </div>
          <Link href="/shop" className="hidden text-accent hover:underline sm:block">
            View all &rarr;
          </Link>
        </Reveal>
        <ProductGrid products={featured} />
      </section>
      <Stats />
    </>
  );
}
