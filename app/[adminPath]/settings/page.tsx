import { getSettings } from "@/lib/settings";
import { SettingsAdmin } from "./SettingsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();
  const initial = {
    storeName: s.storeName,
    storeEmail: s.storeEmail,
    currency: s.currency,
    currencySymbol: s.currencySymbol,
    stripeSecretKey: s.stripeSecretKey,
    paypalClientId: s.paypalClientId,
    freeDeliveryAbove: s.freeDeliveryAbove,
    faviconUrl: s.faviconUrl,
    googleAuthEnabled: s.googleAuthEnabled,
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort,
    smtpUser: s.smtpUser,
    smtpPassword: s.smtpPassword,
    smtpFrom: s.smtpFrom,
    smtpSecure: s.smtpSecure,
  };
  return <SettingsAdmin initial={initial} />;
}
