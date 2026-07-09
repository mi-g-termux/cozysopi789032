"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { PageTransition } from "@/components/motion/Primitives";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import type { DeliveryZoneDTO, CalculateDeliveryResult } from "@/types";
import {
  PaymentMethods,
  type PayMethod,
} from "@/components/checkout/PaymentMethods";

export function CheckoutClient({
  zones,
  payments,
  tax,
}: {
  zones: DeliveryZoneDTO[];
  payments: { cod: boolean; stripe: boolean; paypal: boolean };
  tax: { enabled: boolean; rate: number; label: string; inclusive: boolean };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems, clearCart } = useCart();
  const subtotal = useCart((s) => s.subtotal());

  const [area, setArea] = useState("");
  const [calc, setCalc] = useState<CalculateDeliveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const firstEnabled: PayMethod = payments.cod
    ? "cod"
    : payments.stripe
      ? "stripe"
      : "paypal";
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>(firstEnabled);

  // Keep the selection valid if the enabled methods change.
  useEffect(() => {
    if (!payments[paymentMethod]) setPaymentMethod(firstEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);
  const [form, setForm] = useState({
    email: session?.user?.email ?? "",
    fullName: session?.user?.name ?? "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryCharge = calc ? (calc.isFree ? 0 : calc.charge) : 0;
  const discount = applied ? Math.min(applied.discount, subtotal) : 0;
  const taxable = Math.max(0, subtotal - discount);
  // Inclusive tax is already inside prices, so it is only surfaced, not added.
  const taxAmount =
    tax.enabled && tax.rate > 0
      ? tax.inclusive
        ? taxable - taxable / (1 + tax.rate / 100)
        : taxable * (tax.rate / 100)
      : 0;
  const total =
    taxable + (tax.enabled && !tax.inclusive ? taxAmount : 0) + deliveryCharge;

  async function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      if (json.success) {
        setApplied({ code, discount: json.data.discount });
        toast.success(`Coupon ${code} applied!`);
      } else {
        setApplied(null);
        toast.error(json.error ?? "Invalid coupon.");
      }
    } catch {
      toast.error("Could not validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCoupon("");
  }

  const areaOptions = useMemo(
    () => zones.map((z) => ({ zone: z.name, areas: z.areas })),
    [zones],
  );

  async function onAreaChange(value: string) {
    setArea(value);
    if (!value) return setCalc(null);
    const res = await fetch("/api/delivery-zones/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: value, subtotal }),
    });
    const json = await res.json();
    if (json.success) setCalc(json.data);
  }

  async function placeOrder() {
    if (!area) return toast.error("Please select your delivery area.");
    if (
      !form.email ||
      !form.fullName ||
      !form.phone ||
      !form.street ||
      !form.city
    ) {
      return toast.error("Please complete your delivery details.");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          items: cartItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          area,
          address: {
            fullName: form.fullName,
            phone: form.phone,
            street: form.street,
            area,
            city: form.city,
            postalCode: form.postalCode,
          },
          notes: form.notes,
          paymentMethod,
          couponCode: applied?.code,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not place order.");
        return;
      }
      if (json.data.redirectUrl) {
        window.location.href = json.data.redirectUrl;
        return;
      }
      clearCart();
      router.push(`/order-success?ref=${json.data.orderId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Your cart is empty</h1>
        <a href="/shop" className="btn-primary mt-6">
          Browse the shop
        </a>
      </div>
    );
  }

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value })),
  });

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h1 className="font-heading text-3xl">Checkout</h1>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...field("email")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" {...field("fullName")} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" {...field("phone")} />
              </div>
            </div>
            <div>
              <label className="label">Street address</label>
              <input className="input" {...field("street")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input className="input" {...field("city")} />
              </div>
              <div>
                <label className="label">Postal code</label>
                <input className="input" {...field("postalCode")} />
              </div>
            </div>

            <div>
              <label className="label">Delivery area</label>
              <select
                className="input"
                value={area}
                onChange={(e) => onAreaChange(e.target.value)}
              >
                <option value="">Select your delivery area...</option>
                {areaOptions.map((group) => (
                  <optgroup key={group.zone} label={group.zone}>
                    {group.areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {calc ? (
              <div className="rounded-xl bg-white p-4 text-sm">
                {calc.isFree ? (
                  <p className="font-medium text-olive">
                    \uD83C\uDF89 Free delivery! (Orders above{" "}
                    {formatCurrency(calc.freeAboveAmount ?? 0)})
                  </p>
                ) : (
                  <p>
                    Delivery to {area}:{" "}
                    <strong>{formatCurrency(calc.charge)}</strong>
                  </p>
                )}
                <p className="text-ink/60">
                  Estimated delivery: {calc.estimatedDelivery}
                </p>
                {!calc.isFree &&
                calc.remainingForFree &&
                calc.remainingForFree > 0 ? (
                  <p className="mt-1 text-ink/60">
                    Add {formatCurrency(calc.remainingForFree)} more for free
                    delivery.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className="label">Order notes (optional)</label>
              <textarea className="input" rows={2} {...field("notes")} />
            </div>
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-heading text-xl">Order summary</h2>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.product.name} \u00D7 {item.quantity}
                </span>
                <span>
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="label">Promo code</label>
            {applied ? (
              <div className="flex items-center justify-between rounded-xl bg-olive/10 px-3 py-2 text-sm">
                <span className="font-medium text-olive">
                  {applied.code} applied
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-ink/60 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input flex-1 uppercase"
                  placeholder="Enter code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !coupon.trim()}
                  className="rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          <hr className="my-4 border-secondary/50" />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="mt-2 flex justify-between text-olive">
              <span>Discount ({applied?.code})</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          ) : null}
          {tax.enabled && taxAmount > 0 ? (
            <div className="mt-2 flex justify-between">
              <span>
                {tax.label} ({tax.rate}%{tax.inclusive ? " incl." : ""})
              </span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between">
            <span>Delivery charge</span>
            <span>{formatCurrency(deliveryCharge)}</span>
          </div>
          <hr className="my-4 border-secondary/50" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="mt-6">
            <label className="label">Payment method</label>
            <PaymentMethods
              enabled={payments}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="btn-primary mt-6 w-full disabled:opacity-60"
          >
            {loading
              ? "Placing order..."
              : `Place order \u2014 ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
