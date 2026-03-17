import { BusinessGrid } from "@/components/landing/business-grid";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { ProductGrid } from "@/components/landing/product-grid";
import { TestimonialBanner } from "@/components/landing/testimonial-banner";
import { TrustPanel } from "@/components/landing/trust-panel";
import { faqs } from "@/lib/site-content";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top">
        <HeroSection />
        <ProductGrid />
        <BusinessGrid />
        <LogoMarquee />
        <TestimonialBanner />
        <TrustPanel />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
