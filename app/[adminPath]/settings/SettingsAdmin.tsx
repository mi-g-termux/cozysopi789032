"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type SettingsForm = {
  storeName: string;
  storeEmail: string;
  currency: string;
  currencySymbol: string;
  stripeSecretKey: string;
  paypalClientId: string;
  freeDeliveryAbove: number | null;
  faviconUrl: string;
  googleAuthEnabled: boolean;
  smtpHost: string;
  smtpPort: number | null;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpSecure: boolean;
  googleClientId: string;
  googleClientSecret: string;
  codEnabled: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  paymentSandbox: boolean;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  paypalClientSecret: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  reviewsEnabled: boolean;
  reviewAutoApprove: boolean;
};

export function SettingsAdmin({ initial }: { initial: SettingsForm }) {
  const [form, setForm] = useState<SettingsForm>(initial);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  async function uploadFavicon(file: File | undefined) {
    if (!file) return;
    const accepted = [
      "image/png",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/svg+xml",
      "image/webp",
    ];
    if (!accepted.includes(file.type)) {
      toast.error("Use a PNG, ICO, SVG or WEBP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Favicon must be under 2MB.");
      return;
    }
    setUploadingIcon(true);
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
      if (json.success) {
        setForm((f) => ({ ...f, faviconUrl: json.data.url }));
        toast.success("Favicon uploaded \u2014 click Save settings to apply.");
      } else {
        toast.error(json.error ?? "Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadingIcon(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          freeDeliveryAbove:
            form.freeDeliveryAbove === null ||
            Number.isNaN(form.freeDeliveryAbove)
              ? null
              : Number(form.freeDeliveryAbove),
          smtpPort:
            form.smtpPort === null || Number.isNaN(form.smtpPort)
              ? null
              : Number(form.smtpPort),
        }),
      });
      const json = await res.json();
      if (json.success) toast.success("Settings saved");
      else toast.error(json.error ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const set =
    (k: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl">Store settings</h1>
      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Store name</label>
            <input
              className="input"
              value={form.storeName}
              onChange={set("storeName")}
            />
          </div>
          <div>
            <label className="label">Store email</label>
            <input
              className="input"
              value={form.storeEmail}
              onChange={set("storeEmail")}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              value={form.currency}
              onChange={set("currency")}
            />
          </div>
          <div>
            <label className="label">Currency symbol</label>
            <input
              className="input"
              value={form.currencySymbol}
              onChange={set("currencySymbol")}
            />
          </div>
        </div>
        <div>
          <label className="label">Free delivery above (optional)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.freeDeliveryAbove ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                freeDeliveryAbove:
                  e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>

        <hr className="border-secondary/50" />
        <div>
          <label className="label">Favicon (browser tab icon)</label>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-secondary bg-secondary/20">
              {form.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.faviconUrl}
                  alt="Favicon preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-ink/50">None</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/png,image/x-icon,image/svg+xml,image/webp"
                onChange={(e) => uploadFavicon(e.target.files?.[0])}
                className="text-sm"
                disabled={uploadingIcon}
              />
              <div className="flex items-center gap-3 text-xs text-ink/60">
                <span>
                  {uploadingIcon ? "Uploading..." : "PNG 512x512 recommended."}
                </span>
                {form.faviconUrl ? (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, faviconUrl: "" }))}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary/50" />
        <div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.googleAuthEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, googleAuthEnabled: e.target.checked }))
              }
            />
            Enable “Sign in with Google”
          </label>
          <p className="mt-1 text-xs text-ink/60">
            When off, the Google button is hidden on the login and sign-up pages
            and Google sign-in is blocked server-side. Enter your Google OAuth
            credentials below (or set the GOOGLE_CLIENT_ID /
            GOOGLE_CLIENT_SECRET environment variables).
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Google client ID</label>
              <input
                className="input"
                value={form.googleClientId}
                onChange={set("googleClientId")}
                placeholder="xxxx.apps.googleusercontent.com"
              />
            </div>
            <div>
              <label className="label">Google client secret</label>
              <input
                className="input"
                type="password"
                value={form.googleClientSecret}
                onChange={set("googleClientSecret")}
                placeholder="GOCSPX-..."
              />
            </div>
          </div>
        </div>

        <hr className="border-secondary/50" />
        <p className="text-sm text-ink/60">
          Email (SMTP) — used for verification codes, password resets and order
          emails. Leave blank to fall back to the GMAIL_* environment variables.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">SMTP host</label>
            <input
              className="input"
              value={form.smtpHost}
              onChange={set("smtpHost")}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="label">SMTP port</label>
            <input
              className="input"
              type="number"
              value={form.smtpPort ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  smtpPort:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              placeholder="587"
            />
          </div>
          <div>
            <label className="label">SMTP username</label>
            <input
              className="input"
              value={form.smtpUser}
              onChange={set("smtpUser")}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">SMTP password</label>
            <input
              className="input"
              type="password"
              value={form.smtpPassword}
              onChange={set("smtpPassword")}
              placeholder="app password"
            />
          </div>
          <div>
            <label className="label">From address</label>
            <input
              className="input"
              value={form.smtpFrom}
              onChange={set("smtpFrom")}
              placeholder="Creamy <you@example.com>"
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input
              type="checkbox"
              checked={form.smtpSecure}
              onChange={(e) =>
                setForm((f) => ({ ...f, smtpSecure: e.target.checked }))
              }
            />
            Use TLS/SSL (port 465)
          </label>
        </div>

        <hr className="border-secondary/50" />
        <p className="text-sm font-medium">Payment methods</p>
        <p className="text-xs text-ink/60">
          Turn each method on or off. Keep at least one on so customers can
          check out. Use Sandbox / test mode while testing with test
          credentials.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-secondary/60 p-3 text-sm">
            <input
              type="checkbox"
              checked={form.codEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, codEnabled: e.target.checked }))
              }
            />
            Cash on delivery
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-secondary/60 p-3 text-sm">
            <input
              type="checkbox"
              checked={form.stripeEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, stripeEnabled: e.target.checked }))
              }
            />
            Stripe (card)
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-secondary/60 p-3 text-sm">
            <input
              type="checkbox"
              checked={form.paypalEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, paypalEnabled: e.target.checked }))
              }
            />
            PayPal
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.paymentSandbox}
            onChange={(e) =>
              setForm((f) => ({ ...f, paymentSandbox: e.target.checked }))
            }
          />
          Sandbox / test mode (use test keys &amp; PayPal sandbox environment)
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Stripe secret key</label>
            <input
              className="input"
              type="password"
              value={form.stripeSecretKey}
              onChange={set("stripeSecretKey")}
              placeholder="sk_test_... or sk_live_..."
            />
          </div>
          <div>
            <label className="label">Stripe publishable key</label>
            <input
              className="input"
              value={form.stripePublishableKey}
              onChange={set("stripePublishableKey")}
              placeholder="pk_test_... or pk_live_..."
            />
          </div>
          <div>
            <label className="label">Stripe webhook secret</label>
            <input
              className="input"
              type="password"
              value={form.stripeWebhookSecret}
              onChange={set("stripeWebhookSecret")}
              placeholder="whsec_..."
            />
          </div>
          <div>
            <label className="label">PayPal client ID</label>
            <input
              className="input"
              value={form.paypalClientId}
              onChange={set("paypalClientId")}
            />
          </div>
          <div>
            <label className="label">PayPal client secret</label>
            <input
              className="input"
              type="password"
              value={form.paypalClientSecret}
              onChange={set("paypalClientSecret")}
            />
          </div>
        </div>

        <hr className="border-secondary/50" />
        <p className="text-sm font-medium">Invoicing &amp; tax</p>
        <p className="text-xs text-ink/60">
          Sequential legal invoice numbers and optional tax/VAT for regulated
          markets. The next number increments automatically on each order.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Invoice prefix</label>
            <input
              className="input"
              value={form.invoicePrefix}
              onChange={set("invoicePrefix")}
              placeholder="INV-"
            />
          </div>
          <div>
            <label className="label">Next invoice number</label>
            <input
              className="input"
              type="number"
              value={form.nextInvoiceNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  nextInvoiceNumber: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.taxEnabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, taxEnabled: e.target.checked }))
            }
          />
          Charge tax / VAT on orders
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Tax label</label>
            <input
              className="input"
              value={form.taxLabel}
              onChange={set("taxLabel")}
              placeholder="VAT"
            />
          </div>
          <div>
            <label className="label">Tax rate (%)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.taxRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))
              }
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input
              type="checkbox"
              checked={form.taxInclusive}
              onChange={(e) =>
                setForm((f) => ({ ...f, taxInclusive: e.target.checked }))
              }
            />
            Prices include tax
          </label>
        </div>

        <hr className="border-secondary/50" />
        <p className="text-sm font-medium">Product reviews</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.reviewsEnabled}
            onChange={(e) =>
              setForm((f) => ({ ...f, reviewsEnabled: e.target.checked }))
            }
          />
          Allow customers to submit reviews
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.reviewAutoApprove}
            onChange={(e) =>
              setForm((f) => ({ ...f, reviewAutoApprove: e.target.checked }))
            }
          />
          Auto-approve new reviews (skip moderation)
        </label>

        <button disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
