import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminPath } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { adminPath: string };
}) {
  const adminPath = await getAdminPath();
  // The dynamic segment must match the configured secret admin path.
  if (params.adminPath !== adminPath) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/login?from=/${adminPath}`);
  if (session.user.role !== "admin") notFound();

  const base = `/${adminPath}`;
  const nav = [
    { href: base, label: "Dashboard" },
    { href: `${base}/products`, label: "Products" },
    { href: `${base}/orders`, label: "Orders" },
    { href: `${base}/delivery-zones`, label: "Delivery Zones" },
    { href: `${base}/customers`, label: "Customers" },
    { href: `${base}/settings`, label: "Settings" },
    { href: `${base}/change-password`, label: "Change Password" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="card sticky top-24 p-3">
          <p className="px-3 py-2 font-heading text-lg text-accent">Admin</p>
          <nav className="space-y-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary/40"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
