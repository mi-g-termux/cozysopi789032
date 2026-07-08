"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function toDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Drag-and-drop uploader. Uploads to Cloudinary via /api/upload and stores
 * only the returned URLs. First image is the main image; reorder by moving.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...images];
    let done = 0;
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: unsupported format`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: exceeds 10MB`);
        continue;
      }
      try {
        const dataUri = await toDataUri(file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: dataUri }),
        });
        const json = await res.json();
        if (json.success) next.push(json.data.url);
        else toast.error(json.error ?? "Upload failed");
      } catch {
        toast.error(`${file.name}: upload failed`);
      }
      done += 1;
      setProgress(Math.round((done / files.length) * 100));
    }
    onChange(next);
    setProgress(0);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    if (images.length <= 1) {
      toast.error("At least one image is required.");
      return;
    }
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-accent bg-secondary/20" : "border-secondary"
        }`}
      >
        <p className="font-medium">Drag &amp; drop images here</p>
        <p className="text-sm text-ink/60">
          or click to browse (JPG, PNG, WEBP, AVIF \u00B7 max 10MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {progress > 0 ? (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary/40">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-secondary"
            >
              <Image src={url} alt="" fill className="object-cover" />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded bg-olive px-1.5 py-0.5 text-[10px] text-white">
                  Main
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 p-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="text-white"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-white"
                >
                  &times;
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="text-white"
                >
                  &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
