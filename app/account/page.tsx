import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MapPin,
  LogOut,
  ShoppingBag,
  Wallet,
  Clock,
  Package,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, orderRef } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Soft, palette-safe status colours (default Tailwind shades work on any theme).
function statusStyle(status: string): string {
  const s = status.toLowerCase();
  if (["paid", "confirmed", "completed", "delivered"].includes(s))
    return "bg-emerald-100 text-emerald-700";
  if (["shipped", "out for delivery", "processing"].includes(s))
    return "bg-sky-100 text-sky-700";
  if (["cancelled", "canceled", "refunded", "failed"].includes(s))
    return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700"; // pending / default
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/account");

  const userId = session.user.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  const name = session.user.name ?? session.user.email ?? "there";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const itemCount = orders.reduce(
    (sum, o) => sum + o.items.reduce((n, it) => n + it.quantity, 0),
    0,
  );
  const lastOrder = orders[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* Profile header */}
      <div className="card overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-accent via-accent/80 to-flavor-green" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="-mt-10 grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white bg-accent text-3xl font-bold text-white shadow-md">
                {initial}
              </div>
              <div className="pb-1">
                <h1 className="font-heading text-3xl leading-tight">{name}</h1>
                <p className="text-sm text-ink/60">{session.user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/account/addresses"
                className="btn-outline inline-flex items-center gap-2 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn-outline inline-flex items-center gap-2 text-sm">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{orders.length}</p>
            <p className="mt-1 text-xs text-ink/60">Orders</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-flavor-green/20 text-flavor-green">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">
              {formatCurrency(totalSpent)}
            </p>
            <p className="mt-1 text-xs text-ink/60">Total spent</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/50 text-ink">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{itemCount}</p>
            <p className="mt-1 text-xs text-ink/60">Items bought</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">
              {lastOrder ? formatDate(lastOrder.createdAt) : "\u2014"}
            </p>
            <p className="mt-1 text-xs text-ink/60">Last order</p>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-heading text-2xl">Order history</h2>
        {orders.length > 0 ? (
          <span className="text-sm text-ink/50">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-3 p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="text-ink/70">You have not placed any orders yet.</p>
          <Link href="/shop" className="btn-primary mt-1">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="card overflow-hidden p-0 transition-shadow hover:shadow-hover"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary/60 bg-cream/40 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-lg">{orderRef(o.id)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                      o.status,
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-ink/60">
                    {formatDate(o.createdAt)}
                  </span>
                  <span className="font-bold">{formatCurrency(o.total)}</span>
                </div>
              </div>
              <div className="divide-y divide-secondary/40 px-5">
                {o.items.map((it) => {
                  const img = it.product.images?.[0];
                  return (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 py-3 text-sm"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={it.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-ink/30">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ink">
                          {it.product.name}
                        </p>
                        <p className="text-xs text-ink/50">
                          Qty {it.quantity} &middot; {formatCurrency(it.price)}{" "}
                          each
                        </p>
                      </div>
                      <span className="font-semibold text-ink/80">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
