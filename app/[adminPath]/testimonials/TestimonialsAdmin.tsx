"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { TestimonialDTO } from "@/types";

const EMPTY = {
  name: "",
  role: "",
  quote: "",
  sortOrder: 0,
  active: true,
};

type Draft = typeof EMPTY;

export function TestimonialsAdmin({ initial }: { initial: TestimonialDTO[] }) {
  const [items, setItems] = useState<TestimonialDTO[]>(initial);
  useEffect(() => setItems(initial), [initial]);
  const [form, setForm] = useState<Draft>({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(t: TestimonialDTO) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role,
      quote: t.quote,
      sortOrder: t.sortOrder,
      active: t.active,
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY });
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Enter a name.");
    if (!form.quote.trim()) return toast.error("Enter a quote.");
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          quote: form.quote,
          sortOrder: Number(form.sortOrder) || 0,
          active: form.active,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not save.");
        return;
      }
      if (editingId) {
        setItems((xs) => xs.map((x) => (x.id === editingId ? json.data : x)));
        toast.success("Testimonial updated");
      } else {
        setItems((xs) => [json.data, ...xs]);
        toast.success("Testimonial added");
      }
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: TestimonialDTO) {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) =>
        xs.map((x) => (x.id === t.id ? { ...x, active: !t.active } : x)),
      );
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.filter((x) => x.id !== id));
      toast.success("Deleted");
    } else {
      toast.error(json.error ?? "Could not delete.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl">Testimonials</h1>
      <p className="mt-1 text-sm text-ink/60">
        These appear in the “What people are saying” section on your home page.
        Add, edit, hide or delete them here — no code needed.
      </p>

      <div className="card mt-6 p-6">
        <h2 className="font-heading text-lg">
          {editingId ? "Edit testimonial" : "Add a testimonial"}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Customer name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Aisha Khan"
            />
          </div>
          <div>
            <label className="label">Role / title (optional)</label>
            <input
              className="input"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Cafe Owner"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Quote</label>
          <textarea
            className="input"
            rows={3}
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            placeholder="What did this customer say about you?"
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Sort order (lower shows first)</label>
            <input
              className="input"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sortOrder: Number(e.target.value),
                }))
              }
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Show on home page
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add testimonial"}
          </button>
          {editingId ? (
            <button onClick={cancelEdit} className="btn-outline">
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Quote</th>
              <th className="p-3">Order</th>
              <th className="p-3">Shown</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-secondary/40">
                <td className="p-3 font-medium">{t.name}</td>
                <td className="p-3 text-ink/60">{t.role || "—"}</td>
                <td className="max-w-xs p-3 text-ink/70">
                  <span className="line-clamp-2">{t.quote}</span>
                </td>
                <td className="p-3">{t.sortOrder}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(t)}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      t.active
                        ? "bg-olive/15 text-olive"
                        : "bg-secondary/40 text-ink/50"
                    }`}
                  >
                    {t.active ? "Visible" : "Hidden"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="ml-3 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink/50">
                  No testimonials yet. Add your first one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
