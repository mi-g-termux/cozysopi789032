"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/motion/Primitives";

type Info = { storeName: string; storeEmail: string };

// Animation objects kept as constants (avoids inline literals in JSX props).
const formInitial = { opacity: 0, y: 20 };
const formAnimate = { opacity: 1, y: 0 };
const formTransition = { duration: 0.4 };

function Detail({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/15 text-xl">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="text-sm text-ink/70">{children}</div>
      </div>
    </div>
  );
}

export function ContactClient({ storeName, storeEmail }: Info) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data.message ?? "Message sent!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(json.error ?? "Could not send your message.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-accent">
            Get in touch
          </p>
          <h1 className="mt-2 font-heading text-4xl md:text-5xl">Contact us</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            Questions about an order, a flavour, or a wholesale enquiry? Send us
            a message and the {storeName} team will get back to you.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {/* Details */}
          <div className="space-y-6">
            <Detail icon="📍" title="Visit us">
              12 Sundae Street,
              <br />
              Scoop District, NY 56789
            </Detail>
            <Detail icon="✉️" title="Email">
              <a href={`mailto:${storeEmail}`} className="hover:text-accent">
                {storeEmail}
              </a>
            </Detail>
            <Detail icon="📞" title="Phone">
              <a href="tel:+15551234567" className="hover:text-accent">
                +1 (555) 123-4567
              </a>
            </Detail>
            <Detail icon="🕒" title="Opening hours">
              Mon – Fri: 10:00 AM – 9:00 PM
              <br />
              Sat – Sun: 9:00 AM – 11:00 PM
            </Detail>
            <div className="overflow-hidden rounded-2xl border border-secondary">
              <iframe
                title="Store location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.01%2C40.70%2C-73.96%2C40.73&layer=mapnik"
                className="h-56 w-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={submit}
            initial={formInitial}
            animate={formAnimate}
            transition={formTransition}
            className="card h-fit space-y-4 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Your name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="jane@example.com"
                />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={form.subject}
                onChange={set("subject")}
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input"
                rows={5}
                value={form.message}
                onChange={set("message")}
                placeholder="Write your message..."
              />
            </div>
            <button
              disabled={sending}
              className="btn-primary w-full disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send message"}
            </button>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
}
