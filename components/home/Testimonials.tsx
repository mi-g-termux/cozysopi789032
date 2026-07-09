"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Primitives";

export type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
};

// Card hover animation kept as a constant (avoids inline literals in JSX).
const cardHover = { y: -6 };

// Fallback content used only when the admin hasn't added any testimonials yet.
const FALLBACK: TestimonialItem[] = [
  {
    name: "Aisha Khan",
    role: "Product Manager",
    quote:
      "Genuinely the smoothest ice cream I've had. The mint chocochip tastes like fresh leaves, not toothpaste. My whole team is hooked.",
  },
  {
    name: "Marco Silva",
    role: "Food Writer",
    quote:
      "Creamy nails the balance between playful branding and real quality. Swedish Vanilla is a masterclass in restraint.",
  },
  {
    name: "Yuki Tanaka",
    role: "Cafe Owner",
    quote:
      "We swapped to Creamy pints for our shop last quarter and re-orders doubled. Customers keep asking when the next flavor drops.",
  },
];

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Testimonials({ items }: { items?: TestimonialItem[] }) {
  const reviews = items && items.length > 0 ? items : FALLBACK;

  return (
    <section id="testimonials" className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <Reveal className="mb-14 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-flavor-orange">
            Kind Words
          </div>
          <h2 className="font-heading text-4xl font-bold text-black md:text-5xl">
            What people are saying
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={`${r.name}-${i}`}
              whileHover={cardHover}
              className="rounded-3xl bg-white p-7 shadow-sm"
            >
              <svg
                className="mb-4 h-6 w-6 text-flavor-green"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M7.5 4C5 4 3 6 3 8.5S5 13 7.5 13c.2 0 .4 0 .5-.1C7.6 15 6.3 16.4 4.5 17l.8 1.7C8.7 17.4 11 14.4 11 10.5 11 6.9 9.4 4 7.5 4Zm10 0C15 4 13 6 13 8.5s2 4.5 4.5 4.5c.2 0 .4 0 .5-.1-.4 2.1-1.7 3.5-3.5 4.1l.8 1.7C18.7 17.4 21 14.4 21 10.5 21 6.9 19.4 4 17.5 4Z" />
              </svg>
              <p className="text-sm leading-relaxed text-neutral-700">
                {r.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-green-mint text-xs font-bold text-green-ink">
                  {initialsOf(r.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">
                    {r.name}
                  </div>
                  {r.role ? (
                    <div className="text-xs italic text-neutral-500">
                      {r.role}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
