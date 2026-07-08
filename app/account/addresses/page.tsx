import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressesClient } from "./AddressesClient";
import type { AddressDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/account/addresses");
  const addresses = (await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" }
  })) as AddressDTO[];
  return <AddressesClient initial={addresses} />;
}
