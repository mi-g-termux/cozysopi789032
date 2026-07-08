"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Flavors the hero cycles through \u2014 background color + product tub swap
// together, exactly like the Creamy reference animation.
const flavors = [
  {
    name: "Swedish Vanilla",
    tagline:
      "Pure Madagascar vanilla folded into slow-churned Swedish cream. Simple. Perfect.",
    bg: "#6bb6d6",
    img: "/creamy/tub-vanilla.png",
    sideImg: "/creamy/tub-mint.png",
    calories: "240",
  },
  {
    name: "Mint Chocochip",
    tagline:
      "Cool fresh mint meets shards of dark chocolate. The scoop that wakes you up.",
    bg: "#6bbf7a",
    img: "/creamy/tub-mint.png",
    sideImg: "/creamy/tub-apple.png",
    calories: "270",
  },
  {
    name: "Apple Pie",
    tagline:
      "Warm cinnamon apples, buttery crumble, cold creamy caramel. Dessert reimagined.",
    bg: "#c98452",
    img: "/creamy/tub-apple.png",
    sideImg: "/creamy/tub-vanilla.png",
    calories: "290",
  },
];

export function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % flavors.length), 3600);
    return () => clearInterval(t);
  }, []);

  const flavor = flavors[i];

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {/* Color-cycling background */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: flavor.bg }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Bottom wave pouring into the cream page */}
      <svg
        className="absolute bottom-0 left-0 z-[5] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="#fff2c9"
          d="M0,120 C240,40 480,200 720,120 C960,40 1200,200 1440,120 L1440,220 L0,220 Z"
        />
      </svg>

      {/* Left copy */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-12">
        <div className="max-w-xl">
          <h1 className="font-heading text-5xl font-bold leading-[1.05] text-white drop-shadow-lg sm:text-6xl md:text-7xl">
            Taste Joy in
            <br />
            Every Bite
          </h1>
          <div className="relative mt-6 h-24" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={flavor.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
                className="max-w-md text-sm text-white/95 drop-shadow sm:text-base"
              >
                {flavor.tagline}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Order Now
            </Link>
            <Link
              href="/shop"
              className="rounded-full border-2 border-white bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              See Menu Items
            </Link>
          </div>
        </div>
      </div>

      {/* Center main tub + calorie badge */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative h-[46vh] max-h-[560px] w-[46vh] max-w-[560px] sm:h-[60vh] sm:w-[60vh]">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={flavor.img}
              src={flavor.img}
              alt={`${flavor.name} ice cream tub`}
              initial={{ opacity: 0, scale: 0.7, y: 70 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -70 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
            />
          </AnimatePresence>
          <div className="absolute left-1/2 top-[62%] -translate-x-1/2">
            <div className="rounded-full bg-white/95 px-4 py-2 text-center shadow-lg">
              <div className="text-lg font-bold leading-none text-black">
                {flavor.calories}
              </div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">
                calories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side tub (desktop only) */}
      <div className="pointer-events-none absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:right-16 md:block">
        <div className="relative h-[28vh] max-h-[240px] w-[28vh] max-w-[240px]">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={flavor.sideImg}
              src={flavor.sideImg}
              alt=""
              initial={{ opacity: 0, scale: 0.8, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7, x: -40 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Flavor name pill */}
      <div className="pointer-events-none absolute right-6 top-24 z-20 md:right-24">
        <AnimatePresence mode="wait">
          <motion.span
            key={flavor.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="whitespace-nowrap rounded-full bg-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur"
          >
            {flavor.name}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Flavor dot pager */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {flavors.map((f, idx) => (
          <button
            key={f.name}
            type="button"
            aria-label={`Show ${f.name}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Reviews badge */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 rounded-full bg-[#fff2c9] px-4 py-2 shadow-md md:left-12">
        <div className="flex -space-x-2" aria-hidden>
          <div className="h-8 w-8 rounded-full border-2 border-white bg-orange-300" />
          <div className="h-8 w-8 rounded-full border-2 border-white bg-pink-300" />
          <div className="h-8 w-8 rounded-full border-2 border-white bg-yellow-300" />
        </div>
        <div className="text-xs leading-tight">
          <div className="font-bold text-black">10K+ Reviews</div>
          <div className="text-neutral-600">Customers are satisfied</div>
        </div>
      </div>
    </section>
  );
}
