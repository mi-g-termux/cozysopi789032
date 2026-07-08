"use client";

import { useRef } from "react";
import { Reveal } from "@/components/motion/Primitives";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductDTO } from "@/types";

export function FeaturedCarousel({ products }: { products: ProductDTO[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section className="bg-sand px-4 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Explore Our Delicious Taste
            </h2>
            <p className="mt-2 text-ink/60">
              Handpicked scoops our fans keep coming back for.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll(-1)}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft hover:shadow-hover"
            >
              ←
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft hover:shadow-hover"
            >
              →
            </button>
          </div>
        </Reveal>
        {products.length === 0 ? (
          <div className="card p-12 text-center text-ink/60">
            No products yet. Add some from the admin panel.
          </div>
        ) : (
          <div
            ref={scroller}
            className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-4"
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="w-[240px] shrink-0 snap-start md:w-[260px]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
