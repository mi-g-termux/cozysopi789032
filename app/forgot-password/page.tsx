"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) setSent(true);
      else toast.error(json.error ?? "Could not send reset link.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card p-8">
          <h1 className="font-heading text-3xl">Reset your password</h1>
          {sent ? (
            <p className="mt-4 text-ink/70">
              If an account exists for {email}, we&apos;ve sent a reset link.
              Check your inbox.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
