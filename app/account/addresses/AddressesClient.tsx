"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { AddressDTO } from "@/types";

const empty: AddressDTO = {
  label: "Home",
  fullName: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  postalCode: "",
  isDefault: false,
};

export function AddressesClient({ initial }: { initial: AddressDTO[] }) {
  const [addresses, setAddresses] = useState<AddressDTO[]>(initial);
  const [form, setForm] = useState<AddressDTO>(empty);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not save address.");
        return;
      }
      setAddresses((a) => [...a, json.data]);
      setForm(empty);
      toast.success("Address saved");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      setAddresses((a) => a.filter((x) => x.id !== id));
      toast.success("Address removed");
    }
  }

  const set =
    (k: keyof AddressDTO) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl">Saved addresses</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{a.label}</span>
              {a.isDefault ? (
                <span className="text-xs text-olive">Default</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-ink/70">
              {a.fullName} · {a.phone}
            </p>
            <p className="text-sm text-ink/70">
              {a.street}, {a.area}, {a.city} {a.postalCode}
            </p>
            <button
              onClick={() => remove(a.id)}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="card mt-8 space-y-4 p-6">
        <h2 className="font-heading text-xl">Add a new address</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Label"
            value={form.label}
            onChange={set("label")}
          />
          <input
            className="input"
            placeholder="Full name"
            value={form.fullName}
            onChange={set("fullName")}
            required
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={set("phone")}
            required
          />
          <input
            className="input"
            placeholder="Area"
            value={form.area}
            onChange={set("area")}
            required
          />
          <input
            className="input"
            placeholder="Street"
            value={form.street}
            onChange={set("street")}
            required
          />
          <input
            className="input"
            placeholder="City"
            value={form.city}
            onChange={set("city")}
            required
          />
          <input
            className="input"
            placeholder="Postal code"
            value={form.postalCode ?? ""}
            onChange={set("postalCode")}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.isDefault}
            onChange={(e) =>
              setForm((f) => ({ ...f, isDefault: e.target.checked }))
            }
          />
          Set as default
        </label>
        <button disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : "Save address"}
        </button>
      </form>
    </div>
  );
}
