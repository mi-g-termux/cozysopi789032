"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export type PayMethod = "cod" | "stripe" | "paypal";

const float = {
  animate: { y: [0, -3, 0] },
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
};

const payDark: CSSProperties = { color: "#003087" };
const payLight: CSSProperties = { color: "#009cde" };
const stripePurple: CSSProperties = { color: "#635bff" };

const hoverAnim = { scale: 1.03 };
const tapAnim = { scale: 0.97 };

/** Official PayPal wordmark (brand colours, italic) — no plain text label. */
function PaypalMark() {
  return (
    <span className="select-none text-2xl font-extrabold italic tracking-tight">
      <span style={payDark}>Pay</span>
      <span style={payLight}>Pal</span>
    </span>
  );
}

/** Stripe wordmark in the Stripe brand purple — no plain text label. */
function StripeMark() {
  return (
    <span
      className="select-none text-2xl font-bold lowercase tracking-tight"
      style={stripePurple}
    >
      stripe
    </span>
  );
}

/** Cash-on-delivery: banknote icon above a tidy two-line label (never wraps). */
function CodMark() {
  return (
    <span className="flex select-none flex-col items-center gap-1.5 text-ink">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="2"
          y="6"
          width="20"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="text-center text-xs font-semibold leading-tight">
        Cash on
        <br />
        delivery
      </span>
    </span>
  );
}

const MARKS: Record<PayMethod, ReactNode> = {
  cod: <CodMark />,
  stripe: <StripeMark />,
  paypal: <PaypalMark />,
};

const LABELS: Record<PayMethod, string> = {
  cod: "Cash on delivery",
  stripe: "Pay by card",
  paypal: "PayPal",
};

const COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

export function PaymentMethods({
  enabled,
  value,
  onChange,
}: {
  enabled: Record<PayMethod, boolean>;
  value: PayMethod;
  onChange: (m: PayMethod) => void;
}) {
  const options = (Object.keys(MARKS) as PayMethod[]).filter(
    (id) => enabled[id],
  );

  if (options.length === 0) {
    return (
      <p className="rounded-xl bg-white p-3 text-sm text-ink/60">
        No payment methods are currently available. Please check back soon.
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3 ${COLS[options.length] ?? "sm:grid-cols-3"}`}
    >
      {options.map((id) => {
        const active = value === id;
        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            whileHover={hoverAnim}
            whileTap={tapAnim}
            aria-pressed={active}
            aria-label={LABELS[id]}
            title={LABELS[id]}
            className={`flex h-24 items-center justify-center rounded-2xl border-2 bg-white p-2 transition-colors ${
              active
                ? "border-accent shadow-hover"
                : "border-secondary hover:border-accent/50"
            }`}
          >
            <motion.span
              className="flex items-center justify-center"
              {...(active ? float : {})}
            >
              {MARKS[id]}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
