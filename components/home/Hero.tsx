"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Flavor = {
  name: string;
  tagline: string;
  bg: string;
  img: string;
  sideImg: string;
  calories: string;
};

// Each flavor drives its own background colour, main tub, side tub and copy.
// Scrolling scrubs a pinned GSAP timeline that cross-fades between them.
const DEFAULT_FLAVORS: Flavor[] = [
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

export function Hero({
  heading = "Taste Joy in Every Bite",
  slides,
}: {
  heading?: string;
  slides?: Flavor[];
}) {
  const FLAVORS = slides && slides.length > 0 ? slides : DEFAULT_FLAVORS;
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  // Pinned scroll timeline only on desktop with motion allowed.
  const usePinned = !reduced && !isMobile;

  const container = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const mainRefs = useRef<Array<HTMLImageElement | null>>([]);
  const sideRefs = useRef<Array<HTMLImageElement | null>>([]);
  const nameRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const taglineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const calRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [active, setActive] = useState(0);

  const applyActive = (idx: number) => {
    setActive(idx);
    if (bgRef.current) bgRef.current.style.backgroundColor = FLAVORS[idx].bg;
    FLAVORS.forEach((_, i) => {
      const on = i === idx;
      gsap.set(mainRefs.current[i], {
        opacity: on ? 1 : 0,
        scale: on ? 1 : 0.85,
        y: 0,
      });
      gsap.set(sideRefs.current[i], {
        opacity: on ? 1 : 0,
        scale: on ? 1 : 0.9,
        x: 0,
      });
      gsap.set(nameRefs.current[i], { opacity: on ? 1 : 0 });
      gsap.set(taglineRefs.current[i], { opacity: on ? 1 : 0 });
      gsap.set(calRefs.current[i], { opacity: on ? 1 : 0 });
    });
  };

  useGSAP(
    () => {
      const scene = container.current;
      if (!scene) return;

      // Everything after the first flavor starts hidden.
      FLAVORS.forEach((_, i) => {
        if (i === 0) return;
        gsap.set(mainRefs.current[i], {
          opacity: 0,
          scale: 0.7,
          y: 60,
          force3D: true,
        });
        gsap.set(sideRefs.current[i], {
          opacity: 0,
          scale: 0.8,
          x: 40,
          force3D: true,
        });
        gsap.set(nameRefs.current[i], { opacity: 0, y: 20 });
        gsap.set(taglineRefs.current[i], { opacity: 0, y: 20 });
        gsap.set(calRefs.current[i], { opacity: 0, y: 20 });
      });

      if (!usePinned) {
        applyActive(0);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none", force3D: true },
        scrollTrigger: {
          trigger: scene,
          start: "top top",
          end: "+=2400",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const idx = Math.min(
              FLAVORS.length - 1,
              Math.floor(self.progress * FLAVORS.length),
            );
            setActive(idx);
          },
        },
      });

      for (let i = 1; i < FLAVORS.length; i++) {
        const prev = i - 1;
        tl.addLabel(`step-${i}`)
          .to(
            bgRef.current,
            { backgroundColor: FLAVORS[i].bg, duration: 1 },
            `step-${i}`,
          )
          .to(
            mainRefs.current[prev],
            { opacity: 0, scale: 0.6, y: -80, duration: 1 },
            `step-${i}`,
          )
          .to(
            sideRefs.current[prev],
            { opacity: 0, scale: 0.7, x: -40, duration: 1 },
            `step-${i}`,
          )
          .to(
            nameRefs.current[prev],
            { opacity: 0, y: -20, duration: 0.6 },
            `step-${i}`,
          )
          .to(
            taglineRefs.current[prev],
            { opacity: 0, y: -20, duration: 0.6 },
            `step-${i}`,
          )
          .to(
            calRefs.current[prev],
            { opacity: 0, y: -20, duration: 0.6 },
            `step-${i}`,
          )
          .fromTo(
            mainRefs.current[i],
            { opacity: 0, scale: 0.7, y: 80 },
            { opacity: 1, scale: 1, y: 0, duration: 1 },
            `step-${i}`,
          )
          .fromTo(
            sideRefs.current[i],
            { opacity: 0, scale: 0.8, x: 40 },
            { opacity: 1, scale: 1, x: 0, duration: 1 },
            `step-${i}`,
          )
          .fromTo(
            nameRefs.current[i],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7 },
            `step-${i}+=0.2`,
          )
          .fromTo(
            taglineRefs.current[i],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7 },
            `step-${i}+=0.3`,
          )
          .fromTo(
            calRefs.current[i],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7 },
            `step-${i}+=0.3`,
          );
      }
    },
    { scope: container, dependencies: [usePinned] },
  );

  // Non-pinned modes (mobile / reduced motion): dots + arrow keys switch flavor.
  useEffect(() => {
    if (usePinned) return;
    applyActive(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, usePinned]);

  const goTo = (i: number) => {
    const next = ((i % FLAVORS.length) + FLAVORS.length) % FLAVORS.length;
    setActive(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section
      ref={container}
      id="top"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label="Featured ice cream flavors"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden outline-none"
    >
      {/* Colour-cycling background (driven by GSAP on scroll) */}
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{ backgroundColor: FLAVORS[0].bg }}
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
      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-start px-6 pt-24 text-center md:justify-center md:px-12 md:pt-0 md:text-left">
        <div className="mx-auto max-w-xl md:mx-0">
          <h1 className="font-heading text-4xl font-bold leading-[1.05] text-white [text-shadow:0_3px_18px_rgba(0,0,0,0.22)] sm:text-6xl md:text-7xl">
            {heading}
          </h1>
          <div className="relative mt-6 h-28 sm:h-24" aria-live="polite">
            {FLAVORS.map((f, i) => (
              <p
                key={`tag-${f.name}`}
                ref={(el) => {
                  taglineRefs.current[i] = el;
                }}
                aria-hidden={i !== active}
                className="absolute inset-0 mx-auto max-w-md text-center text-base font-medium text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.28)] md:mx-0 md:text-left"
              >
                {f.tagline}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
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

      {/* Center main tub + calorie badge (stacked, cross-faded) */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-14 md:items-center md:pb-0">
        <div className="relative h-[34vh] max-h-[620px] w-[min(34vh,66vw)] max-w-[620px] sm:h-[68vh] sm:w-[min(68vh,90vw)]">
          {FLAVORS.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`main-${f.name}`}
              ref={(el) => {
                mainRefs.current[i] = el;
              }}
              src={f.img}
              alt={`${f.name} ice cream tub`}
              className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
            />
          ))}
          {FLAVORS.map((f, i) => (
            <div
              key={`cal-${f.name}`}
              ref={(el) => {
                calRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-[62%] -translate-x-1/2"
            >
              <div className="rounded-full bg-white/95 px-4 py-2 text-center shadow-lg">
                <div className="text-lg font-bold leading-none text-black">
                  {f.calories}
                </div>
                <div className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">
                  calories
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side tub (desktop only) */}
      <div className="pointer-events-none absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 md:right-[6%] md:block">
        <div className="relative h-[40vh] max-h-[380px] w-[40vh] max-w-[380px]">
          {FLAVORS.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`side-${f.name}`}
              ref={(el) => {
                sideRefs.current[i] = el;
              }}
              src={f.sideImg}
              alt=""
              className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
            />
          ))}
        </div>
      </div>

      {/* Flavor name pills */}
      <div className="pointer-events-none absolute right-4 top-20 z-20 h-8 w-48 md:right-24 md:top-24">
        {FLAVORS.map((f, i) => (
          <span
            key={`name-${f.name}`}
            ref={(el) => {
              nameRefs.current[i] = el;
            }}
            className="absolute right-0 top-0 whitespace-nowrap rounded-full bg-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur"
          >
            {f.name}
          </span>
        ))}
      </div>

      {/* Flavor dot pager */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {FLAVORS.map((f, idx) => (
          <button
            key={`dot-${f.name}`}
            type="button"
            aria-label={`Show ${f.name}`}
            aria-current={idx === active}
            onClick={() => goTo(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === active
                ? "w-8 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/80"
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
