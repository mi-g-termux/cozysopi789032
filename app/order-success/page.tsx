"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function SuccessInner() {
  const params = useSearchParams();
  const ref = params.get("ref");
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-olive text-4xl text-white"
      >
        \u2713
      </motion.div>
      <h1 className="mt-6 font-heading text-4xl">Order confirmed!</h1>
      <p className="mt-2 text-ink/70">
        Thank you for your order. We&apos;ve emailed your confirmation.
      </p>
      {ref ? (
        <p className="mt-1 text-sm text-ink/50">Reference: {ref}</p>
      ) : null}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
        <Link href="/account" className="btn-outline">
          View orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
