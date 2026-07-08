"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      remember: String(remember),
      totp,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      if (res.error.includes("2FA")) {
        setNeeds2fa(true);
        toast("Enter your 2FA code to continue.");
        return;
      }
      toast.error(friendly(res.error));
      return;
    }
    toast.success("Welcome back!");
    router.push(params.get("from") ?? "/account");
    router.refresh();
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card p-8">
          <h1 className="font-heading text-3xl">Welcome back</h1>
          <p className="mt-1 text-ink/60">Sign in to your account.</p>

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
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {needs2fa ? (
              <div>
                <label className="label">2FA code</label>
                <input
                  className="input tracking-widest"
                  inputMode="numeric"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                />
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Keep me logged in
            </label>
            <button
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="btn-outline mt-3 w-full"
          >
            Continue with Google
          </button>

          <div className="mt-4 flex justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-accent hover:underline"
            >
              Forgot password?
            </Link>
            <Link href="/register" className="text-accent hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function friendly(error: string): string {
  if (error.includes("CredentialsSignin"))
    return "Incorrect email or password.";
  return "Incorrect email or password.";
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
