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
      whileHover={ { y: -4 } }
      className="card group overflow-hidden"
    >
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] ?? "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
          />
          {product.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-olive px-3 py-1 text-xs text-white">
              Featured
            </span>
          ) : null}
          {soldOut ? (
            <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-accent">{product.category}</p>
        <Link href={`/shop/${product.id}`}>
          <h3 className="mt-1 font-heading text-lg">{product.name}</h3>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
          <motion.button
            whileHover={ { scale: 1.03 } }
            whileTap={ { scale: 0.97 } }
            disabled={soldOut}
            onClick={() => {
              addItem(product, 1);
              setDrawer(true);
              toast.success(`${product.name} added to cart`);
            }}
            className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
