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
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6 }}
      className="card group flex h-full flex-col p-4"
    >
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
          <Image
            src={product.images[0] ?? "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {soldOut ? (
            <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <span className="text-lg font-bold">
          {formatCurrency(product.price)}
        </span>
        <Link href={`/shop/${product.id}`}>
          <h3 className="mt-0.5 line-clamp-1 font-heading text-base text-ink">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-ink/50">{product.category}</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={soldOut}
          onClick={() => {
            addItem(product, 1);
            setDrawer(true);
            toast.success(`${product.name} added to cart`);
          }}
          className="btn-primary mt-4 w-full py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut ? "Sold out" : "Buy now"}
        </motion.button>
      </div>
    </motion.div>
  );
}
