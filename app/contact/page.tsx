import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { normalizeContent } from "@/lib/site-content";
import { ContactClient } from "./ContactClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with our team.",
};

export default async function ContactPage() {
  let storeName = "Creamy";
  let storeEmail = "hello@creamy.shop";
  let content = normalizeContent(null);
  try {
    const s = await getSettings();
    storeName = s.brandName || s.storeName || storeName;
    storeEmail = s.storeEmail || storeEmail;
    content = normalizeContent(s);
  } catch {
    // DB unavailable during build — use defaults.
  }

  // The store address (set in Site Content → Footer) drives the map pin.
  const mapQuery =
    content.footerAddress.replace(/\n+/g, ", ").trim() || "ice cream shop";
  const mapSrc =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(mapQuery) +
    "&z=15&output=embed";

  return (
    <ContactClient
      storeName={storeName}
      storeEmail={storeEmail}
      address={content.footerAddress}
      phone={content.footerPhone}
      email={content.footerEmail}
      hours={content.footerHours}
      mapSrc={mapSrc}
    />
  );
}
