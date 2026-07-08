"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { staggerItem } from "@/components/motion/Primitives";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCart((s) => s.addItem);
  const setDrawer = useCart((s) => s.setDrawer);
  const soldOut = product.stock <= 0;

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col items-center rounded-[2rem] bg-white px-6 pb-6 pt-24 text-center shadow-md transition"
    >
      <Link
        href={`/shop/${product.id}`}
        className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2"
      >
        <Image
          src={product.images[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          sizes="160px"
          className="pointer-events-none object-contain drop-shadow-xl transition group-hover:-translate-y-2"
        />
        {soldOut ? (
          <span className="absolute right-0 top-0 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
            Sold out
          </span>
        ) : null}
      </Link>

      <div className="mt-4 text-3xl font-bold text-black">
        {formatCurrency(product.price)}
      </div>
      <Link href={`/shop/${product.id}`}>
        <h3 className="mt-1 line-clamp-1 font-heading text-base text-ink">
          {product.name}
        </h3>
      </Link>
      <div className="mt-1 text-center text-sm text-neutral-500">
        {product.category}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={soldOut}
        onClick={() => {
          addItem(product, 1);
          setDrawer(true);
          toast.success(`${product.name} added to cart`);
        }}
        className="mt-5 rounded-full bg-black px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {soldOut ? "Sold out" : "Buy Now"}
      </motion.button>
    </motion.article>
  );
}
