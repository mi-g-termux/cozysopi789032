"use client";

import { Reveal } from "@/components/motion/Primitives";
import { Counter } from "@/components/motion/Counter";

const stats = [
  { label: "Happy guests served", to: 12000, suffix: "+" },
  { label: "Signature recipes", to: 45, suffix: "" },
  { label: "Cities delivered", to: 8, suffix: "" },
  { label: "Average rating", to: 5, suffix: "\u2605" }
];

export function Stats() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-12 text-center">
          <h2 className="font-heading text-3xl md:text-4xl">Loved at every gathering</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <div className="font-heading text-4xl font-bold text-accent md:text-5xl">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-ink/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
