import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { adminPath: string };
}) {
  const settings = await getSettings();
  const adminPath = settings.adminPath;
  // The dynamic segment must match the configured secret admin path.
  if (params.adminPath !== adminPath) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/login?from=/${adminPath}`);
  if (session.user.role !== "admin") notFound();

  const base = `/${adminPath}`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <AdminSidebar base={base} storeName={settings.storeName} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
