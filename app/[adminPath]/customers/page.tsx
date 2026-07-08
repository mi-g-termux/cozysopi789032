import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-3xl">Customers</h1>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Last login</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-secondary/40">
                <td className="p-3 font-medium">{c.name ?? "\u2014"}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.emailVerified ? "Yes" : "No"}</td>
                <td className="p-3">{c._count.orders}</td>
                <td className="p-3">{formatDate(c.createdAt)}</td>
                <td className="p-3">
                  {c.lastLoginAt ? formatDate(c.lastLoginAt) : "\u2014"}
                </td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink/50">
                  No customers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
