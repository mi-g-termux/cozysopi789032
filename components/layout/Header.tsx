"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/contact", label: "Contact" },
];

export function Header({ brandName = "Creamy" }: { brandName?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCart((s) => s.itemCount());
  const setDrawer = useCart((s) => s.setDrawer);
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-12 md:py-5">
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-ink drop-shadow-sm"
        >
          {brandName}
        </Link>

        {/* Center black pill nav */}
        <nav className="hidden items-center gap-1 rounded-full bg-black/85 px-2 py-2 text-sm font-medium text-white/80 shadow-lg backdrop-blur md:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  active ? "bg-white text-black" : "hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-md hover:bg-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <button
            onClick={() => setDrawer(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-md hover:bg-white"
            aria-label="Open cart"
          >
            <svg
              width="18"
              height="18"
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
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-sm font-semibold text-black shadow-md hover:bg-white"
              >
                {initial}
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden text-sm text-ink/70 hover:text-ink sm:inline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-md hover:bg-white"
              aria-label="Sign in"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {menuOpen ? (
        <nav className="mx-4 mb-2 rounded-2xl bg-black/90 p-2 text-sm font-medium text-white/90 shadow-lg backdrop-blur md:hidden">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 transition-colors ${
                  active ? "bg-white text-black" : "hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
