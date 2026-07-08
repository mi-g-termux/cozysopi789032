"use client";

import { useState } from "react";
import { PageTransition } from "@/components/motion/Primitives";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductDTO } from "@/types";

export function ShopClient({
  products,
  categories,
}: {
  products: ProductDTO[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const filtered =
    active === "All" ? products : products.filter((p) => p.category === active);
  const tabs = ["All", ...categories];

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-heading text-4xl">The menu</h1>
        <p className="mt-2 text-ink/60">
          Fresh appetizers and boards, made to order.
        </p>

        <div className="my-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                active === t
                  ? "bg-accent text-white"
                  : "bg-white text-ink hover:bg-secondary/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <ProductGrid products={filtered} />
      </div>
    </PageTransition>
  );
}
