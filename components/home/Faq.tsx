"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    icon: "\u{1F366}",
    q: "What makes your ice cream different?",
    a: "We use real tropical fruits, fresh dairy, and zero artificial flavours. Every batch is handcrafted in small quantities to maintain quality.",
  },
  {
    icon: "\u{1F69A}",
    q: "Do you offer home delivery?",
    a: "Yes \u2014 we deliver across all our zones in insulated packaging so your ice cream arrives perfectly frozen.",
  },
  {
    icon: "\u{1F33F}",
    q: "Is your ice cream vegan or dairy-free?",
    a: "We offer a growing range of vegan and dairy-free scoops made with coconut and oat bases.",
  },
  {
    icon: "\u{1F382}",
    q: "Can I order in bulk for events/parties?",
    a: "Absolutely. Contact us for bulk and event pricing \u2014 we cater parties of any size.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-sand px-4 py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-grass p-8 text-white shadow-hover md:p-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl font-bold md:text-5xl">
              FAQ&apos;s
            </h2>
            <p className="mt-4 max-w-sm text-white/80">
              We&apos;ve answered the most common questions to make your
              experience as smooth as our ice cream.
            </p>
            <div className="mt-6 flex gap-2">
              {["IG", "X", "in"].map((s) => (
                <span
                  key={s}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const active = open === idx;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-2xl bg-grass-soft/90 text-ink"
                >
                  <button
                    onClick={() => setOpen(active ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <span>{f.icon}</span>
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: active ? 90 : 0 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink"
                    >
                      →
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {active ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/70"
                      >
                        <p className="px-5 py-4 text-sm text-ink/80">{f.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
