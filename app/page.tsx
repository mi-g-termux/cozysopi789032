import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { normalizeContent } from "@/lib/site-content";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { Mission } from "@/components/home/Mission";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Faq } from "@/components/home/Faq";
import {
  Testimonials,
  type TestimonialItem,
} from "@/components/home/Testimonials";
import type { ProductDTO } from "@/types";

// Always render fresh so admin product/settings changes appear live.
export const dynamic = "force-dynamic";

async function getFeatured(): Promise<ProductDTO[]> {
  try {
    return (await prisma.product.findMany({
      where: { active: true, featured: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    })) as ProductDTO[];
  } catch {
    return [];
  }
}

async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((t) => ({ name: t.name, role: t.role, quote: t.quote }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, testimonials, settings] = await Promise.all([
    getFeatured(),
    getTestimonials(),
    getSettings(),
  ]);
  const content = normalizeContent(settings);
  return (
    <SmoothScroll>
      <Hero heading={content.heroHeading} slides={content.heroSlides} />
      <Mission />
      <FeaturedCarousel products={featured} />
      <Faq items={content.faqs} />
      <Testimonials items={testimonials} />
    </SmoothScroll>
  );
}
