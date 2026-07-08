"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/components/motion/Primitives";
import { ProductCard } from "./ProductCard";
import type { ProductDTO } from "@/types";

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  if (products.length === 0) {
    return (
      <div className="card p-12 text-center text-ink/60">
        <p className="text-lg">No products found.</p>
        <p className="mt-1 text-sm">Try a different category or check back soon.</p>
      </div>
    );
  }
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={ { once: true, amount: 0.15 } }
      className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  );
}
