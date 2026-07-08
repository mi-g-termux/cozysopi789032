"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCart((s) => s.itemCount());
  const setDrawer = useCart((s) => s.setDrawer);
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-heading text-2xl font-bold text-ink">
          Creamy
        </Link>

        {/* Center pill nav */}
        <nav className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-soft md:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`pill-nav ${
                  active ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/account"
              className={`pill-nav ${
                pathname.startsWith("/account")
                  ? "bg-ink text-white"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              Account
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawer(true)}
            className="relative rounded-full bg-white/70 p-2.5 shadow-soft hover:bg-white"
            aria-label="Open cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-strawberry text-xs text-white"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                {initial}
              </div>
              <button
                onClick={() => signOut()}
                className="hidden text-sm text-ink/70 hover:text-ink sm:inline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary px-5 py-2 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
