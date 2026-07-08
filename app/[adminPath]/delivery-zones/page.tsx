import { prisma } from "@/lib/prisma";
import { DeliveryZonesAdmin } from "./DeliveryZonesAdmin";
import type { DeliveryZoneDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryZonesPage() {
  const zones = (await prisma.deliveryZone.findMany({
    orderBy: { sortOrder: "asc" }
  })) as DeliveryZoneDTO[];
  return <DeliveryZonesAdmin initial={zones} />;
}
