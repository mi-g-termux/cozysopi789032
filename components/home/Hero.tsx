"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WordReveal } from "@/components/motion/Primitives";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section ref={ref} className="relative flex min-h-[88vh] items-center overflow-hidden">
      <motion.div
        style={ { y } }
        className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/40 via-cream to-cream"
      />
      <motion.div
        style={ { y, opacity } }
        aria-hidden
        className="absolute -right-24 top-24 -z-10 h-96 w-96 rounded-full bg-olive/20 blur-3xl"
      />
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">Warm &amp; cozy</p>
        <WordReveal
          text="Party appetizers people actually remember"
          className="max-w-3xl font-heading text-5xl font-bold leading-tight md:text-6xl"
        />
        <motion.p
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { delay: 0.6, duration: 0.6 } }
          className="mt-6 max-w-xl text-lg text-ink/70"
        >
          Handcrafted bites and boards that balance beauty and everyday function \u2014
          delivered warm, right when your guests arrive.
        </motion.p>
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { delay: 0.8, duration: 0.6 } }
          className="mt-8 flex gap-4"
        >
          <Link href="/shop" className="btn-primary">Shop the menu</Link>
          <Link href="/shop" className="btn-outline">See featured</Link>
        </motion.div>
      </div>
    </section>
  );
}
