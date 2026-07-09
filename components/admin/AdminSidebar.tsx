"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminRealtime } from "@/components/admin/AdminRealtime";

function Icon({ paths }: { paths: string[] }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

type Item = {
  href: string;
  label: string;
  paths: string[];
  exact?: boolean;
};

/**
 * TailAdmin-style dark sidebar. Highlights the active route and mounts the
 * realtime listener so EVERY admin page live-refreshes on any broadcast.
 */
export function AdminSidebar({
  base,
  storeName,
}: {
  base: string;
  storeName: string;
}) {
  const pathname = usePathname();

  const nav: Item[] = [
    {
      href: base,
      label: "Dashboard",
      exact: true,
      paths: ["M3 12l9-9 9 9", "M5 10v10h14V10"],
    },
    {
      href: `${base}/products`,
      label: "Products",
      paths: [
        "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
        "M3.3 7L12 12l8.7-5M12 22V12",
      ],
    },
    {
      href: `${base}/categories`,
      label: "Categories",
      paths: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"],
    },
    {
      href: `${base}/orders`,
      label: "Orders",
      paths: [
        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2",
        "M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z",
      ],
    },
    {
      href: `${base}/reviews`,
      label: "Reviews",
      paths: [
        "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
      ],
    },
    {
      href: `${base}/coupons`,
      label: "Coupons",
      paths: [
        "M20 12a2 2 0 0 1 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1-2-2z",
        "M9 8l6 8",
      ],
    },
    {
      href: `${base}/delivery-zones`,
      label: "Delivery Zones",
      paths: [
        "M1 3h15v13H1zM16 8h4l3 3v5h-7z",
        "M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
      ],
    },
    {
      href: `${base}/customers`,
      label: "Customers",
      paths: [
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        "M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
      ],
    },
    {
      href: `${base}/settings`,
      label: "Settings",
      paths: [
        "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
        "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
      ],
    },
    {
      href: `${base}/change-password`,
      label: "Change Password",
      paths: [
        "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z",
        "M7 11V7a5 5 0 0 1 10 0v4",
      ],
    },
  ];

  return (
    <>
      <AdminRealtime />
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-6 rounded-3xl bg-ink p-4 text-white shadow-soft">
          <div className="flex items-center gap-3 px-2 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-lg">
              🍦
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-base leading-none">
                {storeName}
              </p>
              <p className="text-[11px] text-white/50">Admin panel</p>
            </div>
          </div>

          <nav className="mt-3 space-y-1">
            {nav.map((n) => {
              const active = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent font-medium text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon paths={n.paths} />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon paths={["M19 12H5", "M12 19l-7-7 7-7"]} />
              <span>Back to store</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
