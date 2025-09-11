"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getFeaturedProductsHybrid } from "@/lib/data/data-sync"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { ElevatedCarousel } from "@/components/ui/elevated-carousel"
import { Crown, Sparkles, Star, TrendingUp } from "lucide-react"

export function PremiumShowcase() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPremiumProducts = async () => {
    try {
      const data = await getFeaturedProductsHybrid()
      // Take first 6 products for premium showcase
      setProducts(data?.slice(0, 6) || [])
    } catch (error) {
      console.error("Error fetching premium products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPremiumProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-accent/10 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Premium Collection
              </h2>
              <Crown className="h-8 w-8 text-yellow-500 animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Experience our finest handcrafted pieces in an exclusive spotlight presentation
            </p>
            
            {/* Premium Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 hover-scale">
                <Star className="h-3 w-3 mr-1" />
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover-scale">
                <Sparkles className="h-3 w-3 mr-1" />
                Handcrafted
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover-scale">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Rated
              </Badge>
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="scale" delay={400}>
          <div className="max-w-6xl mx-auto">
            <ElevatedCarousel 
              autoPlay={true} 
              autoPlayInterval={6000}
              className="py-8"
            >
              {products.map((product) => (
                <div key={product.id} className="px-3">
                  <div className="relative group">
                    {/* Premium Border Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                    
                    {/* Premium Badge */}
                    <div className="absolute -top-2 -left-2 z-20">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg animate-pulse">
                        <Crown className="h-3 w-3 mr-1" />
                        PREMIUM
                      </Badge>
                    </div>
                    
                    <div className="relative bg-background rounded-xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <ProductCard product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </ElevatedCarousel>
          </div>
        </AnimatedContainer>

        {/* Call to Action */}
        <AnimatedContainer animation="slideUp" delay={800} className="text-center mt-12">
          <div className="bg-background/80 backdrop-blur border border-accent/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              Discover More Premium Crafts
              <Sparkles className="h-6 w-6 text-accent" />
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore our complete collection of premium handcrafted items, each piece telling its own unique story
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-300 hover-lift hover-glow shadow-lg" asChild>
                <Link href="/products">
                  <Crown className="h-4 w-4 mr-2" />
                  View All Premium
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="hover-lift transition-all duration-300 border-accent/50 hover:border-accent hover:bg-accent/10" asChild>
                <Link href="/featured">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Featured Collection
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">5.0 Rating</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="font-medium">100% Handmade</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Premium Quality</span>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  )
}
