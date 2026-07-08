"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import type { DeliveryZoneDTO } from "@/types";

type Draft = {
  id?: string;
  name: string;
  areasText: string;
  charge: number;
  estimatedDays: string;
  freeAbove: string;
  active: boolean;
};

const emptyDraft: Draft = {
  name: "",
  areasText: "",
  charge: 0,
  estimatedDays: "1-2 days",
  freeAbove: "",
  active: true
};

export function DeliveryZonesAdmin({ initial }: { initial: DeliveryZoneDTO[] }) {
  const [zones, setZones] = useState<DeliveryZoneDTO[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function openNew() {
    setDraft({ ...emptyDraft });
  }
  function openEdit(z: DeliveryZoneDTO) {
    setDraft({
      id: z.id,
      name: z.name,
      areasText: z.areas.join(", "),
      charge: z.charge,
      estimatedDays: z.estimatedDays,
      freeAbove: z.freeAbove?.toString() ?? "",
      active: z.active
    });
  }

  async function save() {
    if (!draft) return;
    const areas = draft.areasText.split(",").map((a) => a.trim()).filter(Boolean);
    if (!draft.name || areas.length === 0) {
      toast.error("Zone name and at least one area are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: draft.name,
        areas,
        charge: Number(draft.charge),
        estimatedDays: draft.estimatedDays,
        freeAbove: draft.freeAbove === "" ? null : Number(draft.freeAbove),
        active: draft.active
      };
      const url = draft.id ? `/api/admin/delivery-zones/${draft.id}` : "/api/admin/delivery-zones";
      const method = draft.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not save zone.");
        return;
      }
      if (draft.id) setZones((zs) => zs.map((z) => (z.id === draft.id ? json.data : z)));
      else setZones((zs) => [...zs, json.data]);
      toast.success("Zone saved");
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this zone?")) return;
    const res = await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setZones((zs) => zs.filter((z) => z.id !== id));
      toast.success("Zone deleted");
    }
  }

  async function persistOrder(next: DeliveryZoneDTO[]) {
    setZones(next);
    await fetch("/api/admin/delivery-zones/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((z) => z.id) })
    });
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...zones];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  }

  const upd = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Delivery zones</h1>
        <button onClick={openNew} className="btn-primary text-sm">Add zone</button>
      </div>
      <p className="mt-1 text-sm text-ink/60">Drag rows to reorder.</p>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Zone</th>
              <th className="p-3">Areas</th>
              <th className="p-3">Charge</th>
              <th className="p-3">Estimate</th>
              <th className="p-3">Free above</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => (
              <tr
                key={z.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="cursor-move border-t border-secondary/40"
              >
                <td className="p-3 font-medium">{z.name}</td>
                <td className="p-3 text-ink/70">{z.areas.join(", ")}</td>
                <td className="p-3">{formatCurrency(z.charge)}</td>
                <td className="p-3">{z.estimatedDays}</td>
                <td className="p-3">{z.freeAbove != null ? formatCurrency(z.freeAbove) : "\u2014"}</td>
                <td className="p-3">{z.active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(z)} className="text-accent hover:underline">Edit</button>
                  <button onClick={() => remove(z.id)} className="ml-3 text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4">
          <div className="card my-8 w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl">{draft.id ? "Edit" : "New"} zone</h2>
              <button onClick={() => setDraft(null)} className="text-2xl">&times;</button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Zone name</label>
                <input className="input" value={draft.name} onChange={(e) => upd({ name: e.target.value })} />
              </div>
              <div>
                <label className="label">Areas (comma separated)</label>
                <input className="input" placeholder="Downtown, City Square, Main Street" value={draft.areasText} onChange={(e) => upd({ areasText: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Delivery charge</label>
                  <input className="input" type="number" step="0.01" value={draft.charge} onChange={(e) => upd({ charge: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Estimated delivery</label>
                  <input className="input" value={draft.estimatedDays} onChange={(e) => upd({ estimatedDays: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Free delivery if order above (optional)</label>
                <input className="input" type="number" step="0.01" value={draft.freeAbove} onChange={(e) => upd({ freeAbove: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.active} onChange={(e) => upd({ active: e.target.checked })} /> Active
              </label>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDraft(null)} className="btn-outline">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? "Saving..." : "Save zone"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
