"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Verification failed.");
        return;
      }
      toast.success("Email verified!");
      // Auto sign-in prompt (password not stored client-side, so send to login).
      router.push("/login");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card p-8 text-center">
          <h1 className="font-heading text-3xl">Verify your email</h1>
          <p className="mt-1 text-ink/60">
            Enter the 6-digit code we sent to {email || "your inbox"}.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              className="input text-center text-2xl tracking-[0.5em]"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
