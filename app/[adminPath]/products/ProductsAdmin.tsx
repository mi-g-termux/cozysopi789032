"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { formatCurrency } from "@/lib/utils";
import type { ProductDTO } from "@/types";

type Draft = Partial<ProductDTO> & { images: string[] };

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: 0,
  costPrice: 0,
  category: "",
  stock: 0,
  featured: false,
  active: true,
  images: [],
};

export function ProductsAdmin({ initial }: { initial: ProductDTO[] }) {
  const [products, setProducts] = useState<ProductDTO[]>(initial);

  // Absorb server-refreshed data pushed by the realtime layer (live sync).
  useEffect(() => setProducts(initial), [initial]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setDraft({ ...emptyDraft });
  }
  function openEdit(p: ProductDTO) {
    setEditingId(p.id);
    setDraft({ ...p });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name || !draft.category || draft.images.length === 0) {
      toast.error("Name, category and at least one image are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          price: Number(draft.price),
          costPrice: Number(draft.costPrice ?? 0),
          category: draft.category,
          stock: Number(draft.stock),
          featured: !!draft.featured,
          active: draft.active !== false,
          images: draft.images,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not save.");
        return;
      }
      if (editingId) {
        setProducts((ps) =>
          ps.map((p) => (p.id === editingId ? json.data : p)),
        );
      } else {
        setProducts((ps) => [json.data, ...ps]);
      }
      toast.success("Saved");
      setDraft(null);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setProducts((ps) => ps.filter((p) => p.id !== id));
      toast.success("Deleted");
    } else {
      toast.error(json.error ?? "Could not delete.");
    }
  }

  const upd = (patch: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Products</h1>
        <button onClick={openNew} className="btn-primary text-sm">
          Add product
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-secondary/40">
                <td className="flex items-center gap-3 p-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{formatCurrency(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : "Hidden"}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="ml-3 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4">
          <div className="card my-8 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl">
                {editingId ? "Edit" : "New"} product
              </h2>
              <button onClick={() => setDraft(null)} className="text-2xl">
                &times;
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <input
                className="input"
                placeholder="Name"
                value={draft.name ?? ""}
                onChange={(e) => upd({ name: e.target.value })}
              />
              <textarea
                className="input"
                placeholder="Description"
                rows={3}
                value={draft.description ?? ""}
                onChange={(e) => upd({ description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="Selling price"
                  value={draft.price ?? 0}
                  onChange={(e) => upd({ price: Number(e.target.value) })}
                />
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="Cost price (for profit)"
                  value={draft.costPrice ?? 0}
                  onChange={(e) => upd({ costPrice: Number(e.target.value) })}
                />
                <input
                  className="input"
                  placeholder="Category"
                  value={draft.category ?? ""}
                  onChange={(e) => upd({ category: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Stock"
                  value={draft.stock ?? 0}
                  onChange={(e) => upd({ stock: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!draft.featured}
                    onChange={(e) => upd({ featured: e.target.checked })}
                  />{" "}
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.active !== false}
                    onChange={(e) => upd({ active: e.target.checked })}
                  />{" "}
                  Active
                </label>
              </div>
              <ImageUploader
                images={draft.images}
                onChange={(next) => upd({ images: next })}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setDraft(null)} className="btn-outline">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-primary disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
