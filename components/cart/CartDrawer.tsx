"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { drawerOpen, setDrawer, cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = useCart((s) => s.subtotal());

  return (
    <AnimatePresence>
      {drawerOpen ? (
        <>
          <motion.div
            key="overlay"
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-50 bg-ink/40"
          />
          <motion.aside
            key="drawer"
            initial={ { x: "100%" } }
            animate={ { x: 0 } }
            exit={ { x: "100%" } }
            transition={ { duration: 0.4, ease: "easeInOut" } }
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-hover"
          >
            <div className="flex items-center justify-between border-b border-secondary/50 p-5">
              <h2 className="font-heading text-xl">Your cart</h2>
              <button onClick={() => setDrawer(false)} aria-label="Close cart" className="text-2xl">
                &times;
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="mt-20 text-center text-ink/60">
                  <p className="text-lg">Your cart is empty.</p>
                  <Link href="/shop" onClick={() => setDrawer(false)} className="btn-outline mt-4">
                    Browse the shop
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-xl bg-white p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-ink/60">{formatCurrency(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-7 w-7 rounded-full border border-secondary">-</button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-7 w-7 rounded-full border border-secondary">+</button>
                        <button onClick={() => removeItem(item.product.id)} className="ml-auto text-sm text-accent hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 ? (
              <div className="border-t border-secondary/50 p-5">
                <div className="mb-3 flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <Link href="/checkout" onClick={() => setDrawer(false)} className="btn-primary w-full">
                  Checkout
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
