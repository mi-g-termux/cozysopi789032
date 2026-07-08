"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, ProductDTO, DeliveryZoneDTO } from "@/types";

type CartState = {
  cartItems: CartItem[];
  selectedArea: string | null;
  deliveryCharge: number;
  deliveryZone: DeliveryZoneDTO | null;
  drawerOpen: boolean;
  // actions
  addItem: (product: ProductDTO, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  setDeliveryArea: (area: string) => Promise<void>;
  setDrawer: (open: boolean) => void;
  mergeGuestCart: (serverItems: CartItem[]) => void;
  // computed
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      selectedArea: null,
      deliveryCharge: 0,
      deliveryZone: null,
      drawerOpen: false,

      addItem: (product, quantity = 1) => {
        const items = [...get().cartItems];
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, product.stock);
        } else {
          items.push({ product, quantity: Math.min(quantity, product.stock || quantity) });
        }
        set({ cartItems: items });
      },

      removeItem: (productId) =>
        set({ cartItems: get().cartItems.filter((i) => i.product.id !== productId) }),

      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.product.id === productId ? { ...i, quantity: qty } : i
          )
        });
      },

      clearCart: () =>
        set({ cartItems: [], selectedArea: null, deliveryCharge: 0, deliveryZone: null }),

      setDeliveryArea: async (area) => {
        set({ selectedArea: area });
        try {
          const res = await fetch("/api/delivery-zones/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ area, subtotal: get().subtotal() })
          });
          const json = await res.json();
          if (json.success) {
            set({ deliveryCharge: json.data.isFree ? 0 : json.data.charge });
          }
        } catch {
          // keep previous charge on failure
        }
      },

      setDrawer: (open) => set({ drawerOpen: open }),

      mergeGuestCart: (serverItems) => {
        const map = new Map<string, CartItem>();
        for (const it of serverItems) map.set(it.product.id, it);
        for (const it of get().cartItems) {
          const ex = map.get(it.product.id);
          if (ex) ex.quantity = Math.max(ex.quantity, it.quantity);
          else map.set(it.product.id, it);
        }
        set({ cartItems: Array.from(map.values()) });
      },

      subtotal: () =>
        get().cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
      total: () => get().subtotal() + get().deliveryCharge,
      itemCount: () => get().cartItems.reduce((s, i) => s + i.quantity, 0)
    }),
    {
      name: "cozy-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as any)
      ),
      partialize: (s) => ({
        cartItems: s.cartItems,
        selectedArea: s.selectedArea,
        deliveryCharge: s.deliveryCharge,
        deliveryZone: s.deliveryZone
      })
    }
  )
);
