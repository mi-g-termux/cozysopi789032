"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/components/motion/Primitives";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductDTO } from "@/types";

export function FeaturedCarousel({ products }: { products: ProductDTO[] }) {
  return (
    <section id="menu" className="relative bg-flavor-orange py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
            Explore Our
            <br />
            Delicious Taste
          </h2>
          <p className="max-w-md text-sm text-white/80">
            Every scoop is a celebration of sunshine. Crafted with love, real
            fruit, and ultra-creamy textures.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[2rem] bg-[#fff2c9] p-12 text-center text-ink/60">
            No products yet. Add some from the admin panel.
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-x-6 gap-y-20 pt-16 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
