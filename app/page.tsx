import { Header } from "@/components/header"
import { PromoBanner } from "@/components/promo-banner"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CategoriesPreview } from "@/components/categories-preview"
import { HowItWorks } from "@/components/how-it-works"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/ui/page-transition"
import { StatsSection } from "@/components/stats-section"
import { WhyChooseUs } from "@/components/why-choose-us"

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <PromoBanner />
        <main className="flex-grow">
          <HeroSection />
          <CategoriesPreview />
          <FeaturedProducts />
          <StatsSection />
          <WhyChooseUs />
          <HowItWorks />
          <NewsletterSignup />
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}
