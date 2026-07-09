import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { Mission } from "@/components/home/Mission";
import { About } from "@/components/home/About";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Faq } from "@/components/home/Faq";
import { Testimonials } from "@/components/home/Testimonials";
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

export default async function HomePage() {
  const featured = await getFeatured();
  let aboutTitle = "";
  let aboutBody = "";
  try {
    const s = await getSettings();
    aboutTitle = s.aboutTitle;
    aboutBody = s.aboutBody;
  } catch {
    // DB unavailable — skip the About section.
  }
  return (
    <SmoothScroll>
      <Hero />
      <Mission />
      <About title={aboutTitle} body={aboutBody} />
      <FeaturedCarousel products={featured} />
      <Faq />
      <Testimonials />
    </SmoothScroll>
  );
}
