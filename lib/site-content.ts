import type { Settings } from "@prisma/client";

export type HeroSlide = {
  name: string;
  tagline: string;
  bg: string;
  img: string;
  sideImg: string;
  calories: string;
};

export type FaqItem = { q: string; a: string };

export type SiteContent = {
  brandName: string;
  heroHeading: string;
  heroSlides: HeroSlide[];
  faqs: FaqItem[];
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerHours: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
};

// Sensible defaults so a brand-new store still looks complete before an admin
// customises anything. normalizeContent() falls back to these when a field is
// empty or missing.
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    name: "Swedish Vanilla",
    tagline:
      "Pure Madagascar vanilla folded into slow-churned Swedish cream. Simple. Perfect.",
    bg: "#6bb6d6",
    img: "/creamy/tub-vanilla.png",
    sideImg: "/creamy/tub-mint.png",
    calories: "240",
  },
  {
    name: "Mint Chocochip",
    tagline:
      "Cool fresh mint meets shards of dark chocolate. The scoop that wakes you up.",
    bg: "#6bbf7a",
    img: "/creamy/tub-mint.png",
    sideImg: "/creamy/tub-apple.png",
    calories: "270",
  },
  {
    name: "Apple Pie",
    tagline:
      "Warm cinnamon apples, buttery crumble, cold creamy caramel. Dessert reimagined.",
    bg: "#c98452",
    img: "/creamy/tub-apple.png",
    sideImg: "/creamy/tub-vanilla.png",
    calories: "290",
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "What makes your ice cream different?",
    a: "We use real tropical fruits, fresh dairy, and zero artificial flavours. Every batch is handcrafted in small quantities to maintain quality.",
  },
  {
    q: "Do you offer home delivery?",
    a: "Yes \u2014 we deliver within 24 hours in insulated packaging to keep every pint at the perfect temperature.",
  },
  {
    q: "Is your ice cream vegan or dairy-free?",
    a: "Several of our flavors have a fully vegan oat-milk variant. Look for the leaf badge on the tub.",
  },
  {
    q: "Can I order in bulk for events/parties?",
    a: "Absolutely. Contact us at least 5 days ahead for custom flavor selections and event pricing.",
  },
];

export const DEFAULT_FOOTER = {
  address: "12 Sundae Street,\nScoop District, NY 56789",
  phone: "+1 (555) 123-4567",
  email: "hello@creamy.shop",
  hours:
    "Mon \u2013 Fri: 10:00 AM \u2013 9:00 PM\nSat \u2013 Sun: 9:00 AM \u2013 11:00 PM",
};

function asArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value) && value.length > 0) return value as T[];
  return fallback;
}

/**
 * Turns the raw Settings row (which stores hero slides / FAQs as JSON) into a
 * fully-populated, typed SiteContent object with defaults applied. Accepts a
 * partial or null value so callers can safely fall back during build.
 */
export function normalizeContent(s?: Partial<Settings> | null): SiteContent {
  return {
    brandName: s?.brandName?.trim() || "Creamy",
    heroHeading: s?.heroHeading?.trim() || "Taste Joy in Every Bite",
    heroSlides: asArray<HeroSlide>(s?.heroSlides, DEFAULT_HERO_SLIDES),
    faqs: asArray<FaqItem>(s?.faqs, DEFAULT_FAQS),
    footerAddress: s?.footerAddress || DEFAULT_FOOTER.address,
    footerPhone: s?.footerPhone || DEFAULT_FOOTER.phone,
    footerEmail: s?.footerEmail || DEFAULT_FOOTER.email,
    footerHours: s?.footerHours || DEFAULT_FOOTER.hours,
    socialInstagram: s?.socialInstagram || "#",
    socialFacebook: s?.socialFacebook || "#",
    socialTwitter: s?.socialTwitter || "#",
  };
}
