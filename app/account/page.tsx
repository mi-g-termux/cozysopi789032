import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, orderRef } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/account");

  const userId = session.user.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl">My account</h1>
          <p className="mt-1 text-ink/60">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/account/addresses" className="btn-outline text-sm">
            Addresses
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="btn-outline text-sm">
              Log out of all devices
            </button>
          </form>
        </div>
      </div>

      <h2 className="mt-10 font-heading text-2xl">Order history</h2>
      {orders.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-ink/60">
          <p>You have no orders yet.</p>
          <Link href="/shop" className="btn-primary mt-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{orderRef(o.id)}</span>
                <span className="rounded-full bg-secondary/40 px-3 py-1 text-xs capitalize">
                  {o.status}
                </span>
                <span className="text-sm text-ink/60">
                  {formatDate(o.createdAt)}
                </span>
                <span className="font-semibold">{formatCurrency(o.total)}</span>
              </div>
              <div className="mt-3 text-sm text-ink/70">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.product.name} × {it.quantity}
                    </span>
                    <span>{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
