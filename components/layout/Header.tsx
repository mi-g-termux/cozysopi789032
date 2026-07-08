"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

export function Header() {
  const { data: session } = useSession();
  const itemCount = useCart((s) => s.itemCount());
  const setDrawer = useCart((s) => s.setDrawer);
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/50 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-heading text-2xl font-bold text-accent">
          Cozy Bites
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="hover:text-accent">Home</Link>
          <Link href="/shop" className="hover:text-accent">Shop</Link>
          {user ? (
            <Link href="/account" className="hover:text-accent">Account</Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDrawer(true)}
            className="relative rounded-full p-2 hover:bg-secondary/30"
            aria-label="Open cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 ? (
              <motion.span
                initial={ { scale: 0 } }
                animate={ { scale: 1 } }
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-xs text-white"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {initial}
              </div>
              <span className="hidden text-sm sm:inline">
                You&apos;re logged in as {user.name ?? user.email}
              </span>
              <button onClick={() => signOut()} className="text-sm text-accent hover:underline">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
