"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What makes your ice cream different?",
    a: "We use real tropical fruits, fresh dairy, and zero artificial flavours. Every batch is handcrafted in small quantities to maintain quality.",
  },
  {
    q: "Do you offer home delivery?",
    a: "Yes \u2014 we deliver within 24 hours in insulated packaging to keep every pint at the perfect temperature.",
  },
  {
    q: "Is your ice cream vegan or dairy-free?",
    a: "Several of our flavors have a fully vegan oat-milk variant. Look for the leaf badge on the tub.",
  },
  {
    q: "Can I order in bulk for events/parties?",
    a: "Absolutely. Contact us at least 5 days ahead for custom flavor selections and event pricing.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-cream pb-24 pt-4">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 rounded-[2.5rem] bg-flavor-green p-8 shadow-lg md:grid-cols-[1fr_1.6fr] md:p-14">
          <div className="text-white">
            <h2 className="font-heading text-4xl font-bold md:text-5xl">
              FAQ&apos;s
            </h2>
            <p className="mt-4 max-w-xs text-sm text-white/85">
              We&apos;ve answered the most common questions to make your
              experience as smooth as our ice cream.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const active = open === idx;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpen(active ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 rounded-full bg-green-soft px-6 py-4 text-left text-sm font-semibold text-[#1f3d24] transition hover:brightness-95"
                  >
                    <span>{f.q}</span>
                    <motion.span
                      animate={{ rotate: active ? 90 : 0 }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#1f3d24]"
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
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 rounded-2xl bg-white/95 px-6 py-4 text-sm text-neutral-700">
                          {f.a}
                        </p>
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
