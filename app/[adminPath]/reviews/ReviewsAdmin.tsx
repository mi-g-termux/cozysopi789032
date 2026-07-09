"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { ReviewDTO } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} out of 5`}>
      {"\u2605".repeat(rating)}
      <span className="text-secondary">{"\u2605".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewsAdmin({ initial }: { initial: ReviewDTO[] }) {
  const [items, setItems] = useState<ReviewDTO[]>(initial);
  useEffect(() => setItems(initial), [initial]);

  async function setApproved(id: string, approved: boolean) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved } : x)));
      toast.success(approved ? "Review approved" : "Review hidden");
    } else {
      toast.error(json.error ?? "Could not update.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setItems((xs) => xs.filter((x) => x.id !== id));
      toast.success("Review deleted");
    } else {
      toast.error(json.error ?? "Could not delete.");
    }
  }

  const pending = items.filter((i) => !i.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Reviews</h1>
        {pending > 0 ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            {pending} awaiting approval
          </span>
        ) : null}
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Author</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-secondary/40 align-top">
                <td className="p-3 font-medium">{r.productName}</td>
                <td className="p-3">{r.authorName}</td>
                <td className="p-3">
                  <Stars rating={r.rating} />
                </td>
                <td className="max-w-xs p-3 text-ink/70">{r.comment}</td>
                <td className="p-3 text-ink/60">{formatDate(r.createdAt)}</td>
                <td className="p-3">
                  {r.approved ? (
                    <span className="rounded bg-olive/15 px-2 py-0.5 text-xs font-semibold text-olive">
                      Approved
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {r.approved ? (
                      <button
                        onClick={() => setApproved(r.id, false)}
                        className="rounded-lg border border-secondary px-2 py-1 text-xs font-semibold"
                      >
                        Hide
                      </button>
                    ) : (
                      <button
                        onClick={() => setApproved(r.id, true)}
                        className="rounded-lg bg-olive px-2 py-1 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink/50">
                  No reviews yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
