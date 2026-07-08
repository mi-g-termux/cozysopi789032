"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { getPusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusher";
import type { ProductDTO } from "@/types";

export function ProductDetail({ product }: { product: ProductDTO }) {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [stock, setStock] = useState(product.stock);
  const addItem = useCart((s) => s.addItem);
  const setDrawer = useCart((s) => s.setDrawer);

  // Real-time stock updates via Pusher (public-shop / stock-update).
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;
    const channel = client.subscribe(CHANNELS.SHOP);
    channel.bind(EVENTS.STOCK_UPDATE, (data: { id: string; stock: number }) => {
      if (data.id === product.id) setStock(data.stock);
    });
    return () => {
      channel.unbind(EVENTS.STOCK_UPDATE);
      client.unsubscribe(CHANNELS.SHOP);
    };
  }, [product.id]);

  const soldOut = stock <= 0;

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
            <Image src={product.images[active] ?? product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 1 ? (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActive(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    i === active ? "border-accent" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-accent">{product.category}</p>
          <h1 className="mt-1 font-heading text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold">{formatCurrency(product.price)}</p>
          <p className="mt-6 leading-relaxed text-ink/70">{product.description}</p>

          <p className={`mt-4 text-sm ${soldOut ? "text-red-500" : "text-olive"}`}>
            {soldOut ? "Currently sold out" : `${stock} in stock`}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-secondary px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock, q + 1))}>+</button>
            </div>
            <motion.button
              whileHover={ { scale: 1.03 } }
              whileTap={ { scale: 0.97 } }
              disabled={soldOut}
              onClick={() => {
                addItem({ ...product, stock }, qty);
                setDrawer(true);
                toast.success("Added to cart");
              }}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
