import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ContactClient } from "./ContactClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with our team.",
};

export default async function ContactPage() {
  let storeName = "Creamy";
  let storeEmail = "hello@creamy.shop";
  try {
    const s = await getSettings();
    storeName = s.storeName || storeName;
    storeEmail = s.storeEmail || storeEmail;
  } catch {
    // DB unavailable during build — use defaults.
  }
  return <ContactClient storeName={storeName} storeEmail={storeEmail} />;
}
