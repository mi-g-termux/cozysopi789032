"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  "We believe in capturing the joy of summer in every scoop.",
  "Our ice creams are made with the finest ingredients and real fruits.",
  "Small-batch, handcrafted, and delivered fresh to your door.",
];

export function Mission() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % lines.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative bg-cream py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, n) => (
          <span
            key={n}
            className="absolute h-3 w-3 animate-float rounded-full bg-flavor-orange/40"
            style={{
              left: `${12 + n * 14}%`,
              top: `${18 + (n % 3) * 24}%`,
              animationDelay: `${n * 0.4}s`,
            }}
          />
        ))}
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="flex min-h-[120px] items-center justify-center md:min-h-[110px]">
          <AnimatePresence mode="wait">
            <motion.h2
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-2xl font-semibold leading-snug text-flavor-orange md:text-4xl"
            >
              {lines[i]}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
