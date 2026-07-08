"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

/** Page enter: fade + slide up { y: 30->0, opacity: 0->1, 0.5s easeOut } */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

/** Stagger container for grids { delayChildren: 0.1, staggerChildren: 0.08 } */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageEnter} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

/** Reveal a section when it scrolls into view (once, threshold 0.2). */
export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const hidden = { opacity: 0, y: 30 };
  const shown = { opacity: 1, y: 0 };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={ { duration: 0.5, ease: "easeOut", delay } }
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word hero reveal using split + stagger. */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  const container = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const word = {
    hidden: { opacity: 0, y: "0.5em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };
  return (
    <motion.h1 className={className} variants={container} initial="hidden" animate="show">
      {words.map((w, i) => (
        <motion.span key={i} className="inline-block" variants={word}>
          {w}&nbsp;
        </motion.span>
      ))}
    </motion.h1>
  );
}
