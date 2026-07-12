import { getSettings } from "@/lib/settings";
import { SettingsAdmin } from "./SettingsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();
  const initial = {
    storeName: s.storeName,
    storeEmail: s.storeEmail,
    adminEmail: s.adminEmail,
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
    googleClientId: s.googleClientId,
    googleClientSecret: s.googleClientSecret,
    codEnabled: s.codEnabled,
    stripeEnabled: s.stripeEnabled,
    paypalEnabled: s.paypalEnabled,
    paymentSandbox: s.paymentSandbox,
    stripePublishableKey: s.stripePublishableKey,
    stripeWebhookSecret: s.stripeWebhookSecret,
    paypalClientSecret: s.paypalClientSecret,
    invoicePrefix: s.invoicePrefix,
    nextInvoiceNumber: s.nextInvoiceNumber,
    taxEnabled: s.taxEnabled,
    taxRate: s.taxRate,
    taxLabel: s.taxLabel,
    taxInclusive: s.taxInclusive,
    reviewsEnabled: s.reviewsEnabled,
    reviewAutoApprove: s.reviewAutoApprove,
  };
  return <SettingsAdmin initial={initial} />;
}
