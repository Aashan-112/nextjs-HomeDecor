import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CategoriesPreview } from "@/components/categories-preview"
import { WhyChooseUs } from "@/components/why-choose-us"
import { HowItWorks } from "@/components/how-it-works"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/ui/page-transition"

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <CategoriesPreview />
          <FeaturedProducts />
          <WhyChooseUs />
          <HowItWorks />
          <NewsletterSignup />
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}
