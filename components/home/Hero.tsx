"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { WordReveal } from "@/components/motion/Primitives";
import { Wave } from "@/components/ui/Wave";

// Flavors the hero cycles through \u2014 background + product swap together,
// exactly like the reference animation.
const flavors = [
  {
    name: "Swedish Vanilla",
    emoji: "\u{1F366}",
    bg: "#6E7B87",
    accent: "#EAD9A0",
  },
  {
    name: "Cookies & Cream",
    emoji: "\u{1F368}",
    bg: "#7B4B3A",
    accent: "#CDA98F",
  },
  {
    name: "Strawberry Swirl",
    emoji: "\u{1F368}",
    bg: "#C7503B",
    accent: "#F2B8AD",
  },
  {
    name: "Mint Chocolate",
    emoji: "\u{1F368}",
    bg: "#3F8B43",
    accent: "#A9DCA6",
  },
  {
    name: "Blueberry Cloud",
    emoji: "\u{1F366}",
    bg: "#4A7BB0",
    accent: "#B9D2EC",
  },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % flavors.length), 3200);
    return () => clearInterval(t);
  }, []);

  const flavor = flavors[i];
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{ backgroundColor: flavor.bg }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/15" />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-28 pt-16 md:grid-cols-2 md:pb-40 md:pt-24">
        {/* Left: copy */}
        <div className="text-white">
          <span className="chip bg-white/20 text-white backdrop-blur">
            🍦 Handcrafted daily
          </span>
          <WordReveal
            text="Taste Joy in Every Bite"
            className="mt-5 font-heading text-5xl font-bold leading-[1.05] md:text-7xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-5 max-w-md text-base text-white/85"
          >
            We capture the joy of summer in every scoop \u2014 made with the
            finest ingredients and real fruits.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/shop"
              className="btn bg-white text-ink shadow-pill hover:-translate-y-0.5 hover:shadow-hover"
            >
              Order now
            </Link>
            <Link
              href="/shop"
              className="btn bg-ink/80 text-white hover:-translate-y-0.5 hover:bg-ink"
            >
              View menu
            </Link>
          </motion.div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-8 w-8 rounded-full border-2 border-white bg-sand"
                />
              ))}
            </div>
            <div className="text-sm text-white/90">
              <span className="font-semibold">10K+</span> Reviews
            </div>
          </div>
        </div>

        {/* Right: cycling product */}
        <div className="relative flex min-h-[320px] items-center justify-center md:min-h-[440px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={flavor.name}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="animate-float">
                <div
                  className="flex h-56 w-56 items-center justify-center rounded-full shadow-hover md:h-72 md:w-72"
                  style={{ backgroundColor: flavor.accent }}
                >
                  <span className="text-8xl md:text-9xl">{flavor.emoji}</span>
                </div>
                <div className="mx-auto -mt-5 w-max rounded-full bg-ink px-4 py-1 text-sm font-semibold text-white shadow-pill">
                  NICK&apos;S · {flavor.name}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute right-2 top-4 h-16 w-16 animate-float-slow rounded-full bg-white/25 md:h-24 md:w-24" />
          <div className="pointer-events-none absolute bottom-6 left-2 h-12 w-12 animate-float rounded-full bg-white/20 md:h-16 md:w-16" />
        </div>
      </div>

      {/* Flavor selector dots */}
      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-32">
        {flavors.map((f, idx) => (
          <button
            key={f.name}
            aria-label={f.name}
            onClick={() => setI(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === i ? "w-7 bg-white" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>

      <Wave color="#FAF7F2" className="absolute bottom-0 left-0 right-0" />
    </section>
  );
}
