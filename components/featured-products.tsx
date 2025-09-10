"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedProductsHybrid } from "@/lib/data/data-sync"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useProductStream } from "@/hooks/use-product-stream"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  // SSE connection for instant featured product updates
  const { isConnected } = useProductStream({
    onNewProduct: (product) => {
      console.log('🎆 New product via SSE - checking if featured:', product.name, product.is_featured)
      if (product.is_featured) {
        toast({
          title: "🎆 New Featured Product!",
          description: `"${product.name}" is now featured - updating instantly!`,
          duration: 4000,
        })
        fetchFeaturedProducts(true)
      }
    },
    onProductUpdate: (product) => {
      console.log('✨ Product updated via SSE - checking featured status:', product.name, product.is_featured)
      // Refresh featured products whenever any product is updated (might have changed featured status)
      toast({
        title: "✨ Featured Products Updated!",
        description: "Featured products list refreshed instantly!",
        duration: 3000,
      })
      fetchFeaturedProducts(true)
    },
    onConnected: () => {
      console.log('🔗 Featured products connected to live updates')
    },
    onError: (error) => {
      console.error('❌ Featured products SSE error:', error)
    }
  })

  const fetchFeaturedProducts = async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    
    try {
      console.log(`🎆 ${silent ? 'Background' : 'Initial'} fetching featured products...`)
      const timestamp = Date.now()
      
      // Add cache-busting to ensure fresh data
      const data = await getFeaturedProductsHybrid()
      console.log(`✅ Featured products fetched: ${data?.length} products`)
      
      // Check for new featured products
      if (silent && data && data.length > products.length) {
        const newFeaturedCount = data.length - products.length
        console.log('🎉 New featured products detected!')
        
        // Show toast notification for new featured products
        toast({
          title: "✨ Featured Products Updated!",
          description: `${newFeaturedCount} new product${newFeaturedCount > 1 ? 's' : ''} ${newFeaturedCount > 1 ? 'have' : 'has'} been featured!`,
          duration: 5000,
        })
      }
      
      setProducts(data || [])
    } catch (error) {
      console.error("❌ Error fetching featured products:", error)
      if (!silent) setProducts([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchFeaturedProducts(false)
  }, [])
  
  // Auto-refresh featured products every 10 seconds to match product page updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing featured products...')
      fetchFeaturedProducts(true)
    }, 1000) // 1 second as SSE fallback
    
    return () => clearInterval(interval)
  }, [products.length])

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover our most popular handcrafted pieces, carefully selected for their exceptional quality and unique
              design.
            </p>
          </div>
        </AnimatedContainer>

        {loading ? (
          <StaggerContainer 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
            staggerDelay={100} 
            animation="scale"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-lg animate-shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 animate-shimmer" />
                  <Skeleton className="h-4 w-1/2 animate-shimmer" />
                  <Skeleton className="h-10 w-full animate-shimmer" />
                </div>
              </div>
            ))}
          </StaggerContainer>
        ) : (
          <>
            <StaggerContainer 
              key={products.length} // Force re-render when products change
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" 
              staggerDelay={150} 
              initialDelay={400}
              animation="slideUp"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggerContainer>

            {products.length > 0 && (
              <AnimatedContainer animation="scale" delay={800} className="text-center">
                <Button size="lg" variant="outline" className="hover-lift hover-glow transition-all duration-300" asChild>
                  <Link href="/products">View All Products</Link>
                </Button>
              </AnimatedContainer>
            )}
          </>
        )}
      </div>
    </section>
  )
}
