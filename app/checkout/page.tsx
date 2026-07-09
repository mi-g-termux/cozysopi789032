import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "./CheckoutClient";
import { getSettings } from "@/lib/settings";
import type { DeliveryZoneDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let zones: DeliveryZoneDTO[] = [];
  try {
    zones = (await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    })) as DeliveryZoneDTO[];
  } catch {
    zones = [];
  }

  const settings = await getSettings();
  const payments = {
    cod: settings.codEnabled,
    stripe: settings.stripeEnabled,
    paypal: settings.paypalEnabled,
  };

  return <CheckoutClient zones={zones} payments={payments} />;
}
