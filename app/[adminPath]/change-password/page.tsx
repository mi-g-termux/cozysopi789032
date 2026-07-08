"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not change password.");
        return;
      }
      toast.success("Password changed. Please sign in again.");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 1200);
    } finally {
      setSaving(false);
    }
  }

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-3xl">Change password</h1>
      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Current password</label>
          <input
            className="input"
            type="password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            required
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            value={form.newPassword}
            onChange={set("newPassword")}
            required
          />
          <p className="mt-1 text-xs text-ink/50">
            Min 12 chars with upper, lower, number &amp; symbol.
          </p>
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input
            className="input"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            required
          />
        </div>
        <button disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
