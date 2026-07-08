"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not register.");
        return;
      }
      toast.success(json.data.message ?? "Check your email for a code.");
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card p-8">
          <h1 className="font-heading text-3xl">Create your account</h1>
          <p className="mt-1 text-ink/60">Join Cozy Bites in a minute.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <button onClick={() => signIn("google", { callbackUrl: "/account" })} className="btn-outline mt-3 w-full">
            Continue with Google
          </button>

          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
