"use client";

import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageTransition } from "@/components/motion/Primitives";

type Info = {
  storeName: string;
  storeEmail: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapSrc: string;
};

// Animation objects kept as constants (avoids inline literals in JSX props).
const formInitial = { opacity: 0, y: 20 };
const formAnimate = { opacity: 1, y: 0 };
const formTransition = { duration: 0.4 };

function Detail({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="text-sm text-ink/70">{children}</div>
      </div>
    </div>
  );
}

/** Render multi-line text (newlines -> <br/>). */
function Lines({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

export function ContactClient({
  storeName,
  storeEmail,
  address,
  phone,
  email,
  hours,
  mapSrc,
}: Info) {
  const contactEmail = email || storeEmail;
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

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
            <Detail icon={<MapPin className="h-5 w-5" />} title="Visit us">
              <Lines text={address} />
            </Detail>
            <Detail icon={<Mail className="h-5 w-5" />} title="Email">
              <a href={`mailto:${contactEmail}`} className="hover:text-accent">
                {contactEmail}
              </a>
            </Detail>
            <Detail icon={<Phone className="h-5 w-5" />} title="Phone">
              <a href={telHref} className="hover:text-accent">
                {phone}
              </a>
            </Detail>
            <Detail icon={<Clock className="h-5 w-5" />} title="Opening hours">
              <Lines text={hours} />
            </Detail>
            <div className="overflow-hidden rounded-2xl border border-secondary">
              <iframe
                title="Store location"
                src={mapSrc}
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
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
