"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type SettingsForm = {
  storeName: string;
  storeEmail: string;
  currency: string;
  currencySymbol: string;
  stripeSecretKey: string;
  paypalClientId: string;
  freeDeliveryAbove: number | null;
};

export function SettingsAdmin({ initial }: { initial: SettingsForm }) {
  const [form, setForm] = useState<SettingsForm>(initial);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          freeDeliveryAbove:
            form.freeDeliveryAbove === null || Number.isNaN(form.freeDeliveryAbove)
              ? null
              : Number(form.freeDeliveryAbove)
        })
      });
      const json = await res.json();
      if (json.success) toast.success("Settings saved");
      else toast.error(json.error ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const set = (k: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl">Store settings</h1>
      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Store name</label>
            <input className="input" value={form.storeName} onChange={set("storeName")} />
          </div>
          <div>
            <label className="label">Store email</label>
            <input className="input" value={form.storeEmail} onChange={set("storeEmail")} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className="input" value={form.currency} onChange={set("currency")} />
          </div>
          <div>
            <label className="label">Currency symbol</label>
            <input className="input" value={form.currencySymbol} onChange={set("currencySymbol")} />
          </div>
        </div>
        <div>
          <label className="label">Free delivery above (optional)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.freeDeliveryAbove ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, freeDeliveryAbove: e.target.value === "" ? null : Number(e.target.value) }))}
          />
        </div>
        <hr className="border-secondary/50" />
        <p className="text-sm text-ink/60">Payment keys (also configurable via environment variables).</p>
        <div>
          <label className="label">Stripe secret key</label>
          <input className="input" value={form.stripeSecretKey} onChange={set("stripeSecretKey")} placeholder="sk_..." />
        </div>
        <div>
          <label className="label">PayPal client ID</label>
          <input className="input" value={form.paypalClientId} onChange={set("paypalClientId")} />
        </div>
        <button disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
