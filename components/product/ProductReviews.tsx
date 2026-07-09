"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`text-lg leading-none ${
            n <= value ? "text-amber-500" : "text-secondary"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          {"\u2605"}
        </button>
      ))}
    </span>
  );
}

export function ProductReviews({
  productId,
  reviewsEnabled,
}: {
  productId: string;
  reviewsEnabled: boolean;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data.reviews);
        setAverage(json.data.average);
        setCount(json.data.count);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Please enter your name.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: name,
          rating,
          comment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data.message ?? "Thanks for your review!");
        setName("");
        setComment("");
        setRating(5);
        if (!json.data.pending) load();
      } else {
        toast.error(json.error ?? "Could not submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-2xl">Reviews</h2>
        {count > 0 ? (
          <span className="flex items-center gap-2 text-sm text-ink/70">
            <Stars value={Math.round(average)} />
            {average.toFixed(1)} ({count})
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          {loading ? (
            <p className="text-ink/50">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-ink/50">
              No reviews yet. Be the first to share your thoughts!
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.authorName}</span>
                  <Stars value={r.rating} />
                </div>
                {r.comment ? (
                  <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
                ) : null}
              </div>
            ))
          )}
        </div>

        {reviewsEnabled ? (
          <form onSubmit={submit} className="card h-fit space-y-4 p-6">
            <h3 className="font-heading text-lg">Write a review</h3>
            <div>
              <label className="label">Your name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Rating</label>
              <div className="mt-1">
                <Stars value={rating} onChange={setRating} />
              </div>
            </div>
            <div>
              <label className="label">Comment</label>
              <textarea
                className="input"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think?"
              />
            </div>
            <button
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
