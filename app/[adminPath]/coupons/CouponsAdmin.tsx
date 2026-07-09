"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { CouponDTO } from "@/types";

const EMPTY = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: 10,
  active: true,
  minSubtotal: 0,
  maxUses: "" as string,
  expiresAt: "" as string,
};

export function CouponsAdmin({ initial }: { initial: CouponDTO[] }) {
  const [items, setItems] = useState<CouponDTO[]>(initial);
  useEffect(() => setItems(initial), [initial]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!form.code.trim()) return toast.error("Enter a coupon code.");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          active: form.active,
          minSubtotal: Number(form.minSubtotal) || 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((xs) => [
          {
            ...json.data,
            expiresAt: json.data.expiresAt ?? null,
          },
          ...xs,
        ]);
        setForm({ ...EMPTY });
        toast.success("Coupon created");
      } else {
        toast.error(json.error ?? "Could not create coupon.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: CouponDTO) {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) =>
        xs.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)),
      );
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.filter((x) => x.id !== id));
      toast.success("Coupon deleted");
    } else {
      toast.error(json.error ?? "Could not delete.");
    }
  }

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  return (
    <div>
      <h1 className="font-heading text-3xl">Coupons</h1>

      <div className="card mt-6 p-6">
        <h2 className="font-heading text-lg">Create a coupon</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Code</label>
            <input
              className="input uppercase"
              value={form.code}
              onChange={set("code")}
              placeholder="WELCOME10"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as "percent" | "fixed",
                }))
              }
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div>
            <label className="label">
              Value {form.type === "percent" ? "(%)" : ""}
            </label>
            <input
              className="input"
              type="number"
              value={form.value}
              onChange={set("value")}
            />
          </div>
          <div>
            <label className="label">Min. subtotal</label>
            <input
              className="input"
              type="number"
              value={form.minSubtotal}
              onChange={set("minSubtotal")}
            />
          </div>
          <div>
            <label className="label">Max uses (blank = unlimited)</label>
            <input
              className="input"
              type="number"
              value={form.maxUses}
              onChange={set("maxUses")}
            />
          </div>
          <div>
            <label className="label">Expires (blank = never)</label>
            <input
              className="input"
              type="date"
              value={form.expiresAt}
              onChange={set("expiresAt")}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={set("active")}
            />
            Active
          </label>
          <button
            onClick={create}
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create coupon"}
          </button>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min</th>
              <th className="p-3">Uses</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-secondary/40">
                <td className="p-3 font-mono font-semibold">{c.code}</td>
                <td className="p-3">
                  {c.type === "percent" ? `${c.value}%` : c.value}
                </td>
                <td className="p-3">{c.minSubtotal || "\u2014"}</td>
                <td className="p-3">
                  {c.usedCount}
                  {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="p-3 text-ink/60">
                  {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.active
                        ? "bg-olive/15 text-olive"
                        : "bg-secondary/40 text-ink/50"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink/50">
                  No coupons yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
