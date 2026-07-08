"use client";

import Link from "next/link";
import Image from "next/image";
import { PageTransition } from "@/components/motion/Primitives";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const subtotal = useCart((s) => s.subtotal());

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-heading text-4xl">Your cart</h1>
        {cartItems.length === 0 ? (
          <div className="card mt-8 p-12 text-center text-ink/60">
            <p className="text-lg">Your cart is empty.</p>
            <Link href="/shop" className="btn-primary mt-4">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="card flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-lg">{item.product.name}</p>
                    <p className="text-ink/60">
                      {formatCurrency(item.product.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="h-8 w-8 rounded-full border border-secondary"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="h-8 w-8 rounded-full border border-secondary"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-4 text-sm text-accent hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="card h-fit p-6">
              <h2 className="font-heading text-xl">Summary</h2>
              <div className="mt-4 flex justify-between text-ink/70">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Delivery calculated at checkout.
              </p>
              <Link href="/checkout" className="btn-primary mt-6 w-full">
                Proceed to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
