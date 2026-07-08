import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./CheckoutClient";
import type { DeliveryZoneDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let zones: DeliveryZoneDTO[] = [];
  try {
    zones = (await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" }
    })) as DeliveryZoneDTO[];
  } catch {
    zones = [];
  }
  return <CheckoutClient zones={zones} />;
}
