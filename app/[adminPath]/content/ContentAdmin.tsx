"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { SiteContent, HeroSlide, FaqItem } from "@/lib/site-content";

export function ContentAdmin({ initial }: { initial: SiteContent }) {
  const [form, setForm] = useState<SiteContent>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImage(file: File | undefined): Promise<string | null> {
    if (!file) return null;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return null;
    }
    try {
      const dataUri: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: dataUri }),
      });
      const json = await res.json();
      if (json.success) return json.data.url as string;
      toast.error(json.error ?? "Upload failed.");
      return null;
    } catch {
      toast.error("Upload failed.");
      return null;
    }
  }

  // ---- Hero slide helpers -------------------------------------------------
  function setSlide(index: number, patch: Partial<HeroSlide>) {
    setForm((f) => ({
      ...f,
      heroSlides: f.heroSlides.map((s, i) =>
        i === index ? { ...s, ...patch } : s,
      ),
    }));
  }
  function addSlide() {
    setForm((f) => ({
      ...f,
      heroSlides: [
        ...f.heroSlides,
        {
          name: "New flavour",
          tagline: "",
          bg: "#6bb6d6",
          img: "",
          sideImg: "",
          calories: "",
        },
      ],
    }));
  }
  function removeSlide(index: number) {
    setForm((f) => ({
      ...f,
      heroSlides: f.heroSlides.filter((_, i) => i !== index),
    }));
  }
  function moveSlide(index: number, dir: -1 | 1) {
    setForm((f) => {
      const arr = [...f.heroSlides];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return f;
      const tmp = arr[index];
      arr[index] = arr[j];
      arr[j] = tmp;
      return { ...f, heroSlides: arr };
    });
  }

  // ---- FAQ helpers --------------------------------------------------------
  function setFaq(index: number, patch: Partial<FaqItem>) {
    setForm((f) => ({
      ...f,
      faqs: f.faqs.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }
  function addFaq() {
    setForm((f) => ({ ...f, faqs: [...f.faqs, { q: "", a: "" }] }));
  }
  function removeFaq(index: number) {
    setForm((f) => ({ ...f, faqs: f.faqs.filter((_, i) => i !== index) }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) toast.success("Content saved \u2014 live on the site.");
      else toast.error(json.error ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8 pb-24">
      <div>
        <h1 className="font-heading text-3xl">Site content</h1>
        <p className="mt-1 text-sm text-ink/60">
          Edit everything customers see on the homepage — branding, the animated
          hero cups, FAQ and footer. No code needed.
        </p>
      </div>

      {/* Branding */}
      <section className="card space-y-4 p-6">
        <h2 className="font-heading text-xl">Branding</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Logo / brand name</label>
            <input
              className="input"
              value={form.brandName}
              onChange={(e) => update("brandName", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">
              Shown in the header, footer and admin panel.
            </p>
          </div>
          <div>
            <label className="label">Hero heading</label>
            <input
              className="input"
              value={form.heroHeading}
              onChange={(e) => update("heroHeading", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">
              The big animated title on the homepage.
            </p>
          </div>
        </div>
      </section>

      {/* Hero slides */}
      <section className="card space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl">Hero animation slides</h2>
            <p className="text-sm text-ink/60">
              These are the animated cups shown when the site opens. Replace an
              image to swap in any product you like.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlide}
            className="btn-outline shrink-0"
          >
            Add slide
          </button>
        </div>
        <div className="space-y-4">
          {form.heroSlides.map((slide, i) => {
            const swatchStyle = { backgroundColor: slide.bg || "#6bb6d6" };
            return (
              <div
                key={i}
                className="rounded-2xl border border-secondary/60 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Slide {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveSlide(i, -1)}
                      disabled={i === 0}
                      className="rounded-lg border border-secondary px-2 py-1 text-xs disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(i, 1)}
                      disabled={i === form.heroSlides.length - 1}
                      className="rounded-lg border border-secondary px-2 py-1 text-xs disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSlide(i)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Flavour name</label>
                    <input
                      className="input"
                      value={slide.name}
                      onChange={(e) => setSlide(i, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Calories</label>
                    <input
                      className="input"
                      value={slide.calories}
                      onChange={(e) =>
                        setSlide(i, { calories: e.target.value })
                      }
                      placeholder="240"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Tagline</label>
                    <textarea
                      className="input min-h-[70px]"
                      value={slide.tagline}
                      onChange={(e) => setSlide(i, { tagline: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Background colour</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={slide.bg || "#6bb6d6"}
                        onChange={(e) => setSlide(i, { bg: e.target.value })}
                        className="h-10 w-12 shrink-0 rounded-lg border border-secondary"
                        aria-label="Pick background colour"
                      />
                      <input
                        className="input"
                        value={slide.bg}
                        onChange={(e) => setSlide(i, { bg: e.target.value })}
                        placeholder="#6bb6d6"
                      />
                      <span
                        style={swatchStyle}
                        className="h-8 w-8 shrink-0 rounded-full border border-secondary"
                      />
                    </div>
                  </div>
                  <ImageField
                    label="Main cup image"
                    value={slide.img}
                    busy={uploading === "img-" + i}
                    onPick={async (file) => {
                      setUploading("img-" + i);
                      const url = await uploadImage(file);
                      setUploading(null);
                      if (url) setSlide(i, { img: url });
                    }}
                    onClear={() => setSlide(i, { img: "" })}
                  />
                  <ImageField
                    label="Side cup image (desktop)"
                    value={slide.sideImg}
                    busy={uploading === "side-" + i}
                    onPick={async (file) => {
                      setUploading("side-" + i);
                      const url = await uploadImage(file);
                      setUploading(null);
                      if (url) setSlide(i, { sideImg: url });
                    }}
                    onClear={() => setSlide(i, { sideImg: "" })}
                  />
                </div>
              </div>
            );
          })}
          {form.heroSlides.length === 0 ? (
            <p className="text-sm text-ink/50">
              No slides yet. Add one to show the hero animation.
            </p>
          ) : null}
        </div>
      </section>

      {/* FAQ */}
      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl">FAQ</h2>
          <button
            type="button"
            onClick={addFaq}
            className="btn-outline shrink-0"
          >
            Add question
          </button>
        </div>
        <div className="space-y-4">
          {form.faqs.map((item, i) => (
            <div key={i} className="rounded-2xl border border-secondary/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Q{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <label className="label">Question</label>
              <input
                className="input"
                value={item.q}
                onChange={(e) => setFaq(i, { q: e.target.value })}
              />
              <label className="label mt-3">Answer</label>
              <textarea
                className="input min-h-[70px]"
                value={item.a}
                onChange={(e) => setFaq(i, { a: e.target.value })}
              />
            </div>
          ))}
          {form.faqs.length === 0 ? (
            <p className="text-sm text-ink/50">No questions yet.</p>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <section className="card space-y-4 p-6">
        <h2 className="font-heading text-xl">Footer</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea
              className="input min-h-[60px]"
              value={form.footerAddress}
              onChange={(e) => update("footerAddress", e.target.value)}
              placeholder="12 Baker Street, London, UK"
            />
            <p className="mt-1 text-xs text-ink/50">
              This is your store location — it also sets the map pin on the
              Contact page. Press Enter for a new line.
            </p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.footerPhone}
              onChange={(e) => update("footerPhone", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input
              className="input"
              value={form.footerEmail}
              onChange={(e) => update("footerEmail", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Opening hours</label>
            <textarea
              className="input min-h-[60px]"
              value={form.footerHours}
              onChange={(e) => update("footerHours", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">One line per row.</p>
          </div>
          <div>
            <label className="label">Instagram URL</label>
            <input
              className="input"
              value={form.socialInstagram}
              onChange={(e) => update("socialInstagram", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="label">Facebook URL</label>
            <input
              className="input"
              value={form.socialFacebook}
              onChange={(e) => update("socialFacebook", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="label">Twitter / X URL</label>
            <input
              className="input"
              value={form.socialTwitter}
              onChange={(e) => update("socialTwitter", e.target.value)}
              placeholder="https://x.com/..."
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          disabled={saving}
          className="btn-primary shadow-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save content"}
        </button>
      </div>
    </form>
  );
}

function ImageField({
  label,
  value,
  busy,
  onPick,
  onClear,
}: {
  label: string;
  value: string;
  busy: boolean;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-secondary bg-secondary/20">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-ink/50">None</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            className="text-xs"
            disabled={busy}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <div className="flex items-center gap-3 text-xs text-ink/60">
            <span>
              {busy
                ? "Uploading..."
                : "PNG with a transparent background works best."}
            </span>
            {value ? (
              <button
                type="button"
                onClick={onClear}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
