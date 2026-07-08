"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Primitives";

const reviews = [
  {
    name: "Aisha Khan",
    role: "Ice cream lover",
    text: "Absolutely the creamiest scoop I\u2019ve had. The strawberry tastes like real fruit \u2014 not syrup. Delivery was fast and still frozen solid!",
  },
  {
    name: "Daniel Cruz",
    role: "Regular customer",
    text: "Cookies & cream is unreal. Ordered for my daughter\u2019s birthday and everyone asked where it was from. New family favourite.",
  },
  {
    name: "Maya Lin",
    role: "Event planner",
    text: "Catered a 60-person party with Creamy. Seamless bulk ordering and the mint chocolate was gone in minutes. Highly recommend.",
  },
];

export function Testimonials() {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <section className="bg-cream px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            What our customers say
          </h2>
          <p className="mt-2 text-ink/60">
            Real stories from real people who can&apos;t get enough of Creamy.
          </p>
        </Reveal>
        <div
          ref={scroller}
          className="no-scrollbar flex snap-x gap-6 overflow-x-auto pb-4"
        >
          {reviews.map((r) => (
            <motion.div
              key={r.name}
              whileHover={{ y: -6 }}
              className="card w-[300px] shrink-0 snap-start p-6 md:w-[360px]"
            >
              <div className="text-4xl leading-none text-secondary">
                &ldquo;
              </div>
              <p className="mt-2 text-sm text-ink/80">{r.text}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-grass-soft font-semibold text-grass-dark">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-ink/50">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft hover:shadow-hover"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft hover:shadow-hover"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
