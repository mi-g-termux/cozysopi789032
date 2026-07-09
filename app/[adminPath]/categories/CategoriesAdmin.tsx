"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
};

export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  useEffect(() => setItems(initial), [initial]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sortOrder: items.length }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not add.");
        return;
      }
      setItems((xs) => [...xs, json.data]);
      setName("");
      toast.success("Category added");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(c: Category) {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.map((x) => (x.id === c.id ? json.data : x)));
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.filter((c) => c.id !== id));
      toast.success("Deleted");
    } else {
      toast.error(json.error ?? "Could not delete.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-ink/60">
        Categories you add here can be used when creating products.
      </p>
      <div className="card mt-6 flex gap-3 p-4">
        <input
          className="input"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <button
          onClick={add}
          disabled={saving}
          className="btn-primary shrink-0 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-secondary/40">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-ink/60">{c.slug}</td>
                <td className="p-3">{c.active ? "Active" : "Hidden"}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggle(c)}
                    className="text-accent hover:underline"
                  >
                    {c.active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="ml-3 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-ink/50" colSpan={4}>
                  No categories yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
