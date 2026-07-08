import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LiveRefresh } from "@/components/realtime/LiveRefresh";
import { getSettings } from "@/lib/settings";

// Bubbly rounded display font to match the animation reference (headings)
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "";
  try {
    const s = await getSettings();
    faviconUrl = s.faviconUrl ?? "";
  } catch {
    // During build or when the DB is unavailable, fall back to the default icon.
  }
  return {
    title: "Creamy \u2014 Taste Joy in Every Bite",
    description:
      "Creamy \u2014 handcrafted ice cream made with the finest ingredients and real fruits, delivered to your door.",
    icons: {
      icon: faviconUrl || "/favicon-default.png",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Providers>
          <LiveRefresh />
          <Header />
          <CartDrawer />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
