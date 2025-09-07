"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/types"
import { getFeaturedProductsHybrid } from "@/lib/data/data-sync"
import { useWishlist } from "@/contexts/wishlist-context"
import { toast } from "sonner"

export default function FeaturedPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toggleItem, isInWishlist } = useWishlist()

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const data = await getFeaturedProductsHybrid()
        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const handleToggleWishlist = async (productId: string) => {
    try {
      await toggleItem(productId)
      const inWishlist = isInWishlist(productId)
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist")
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Please sign in to manage your wishlist")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Products</h1>
          <p className="text-lg text-muted-foreground">
            Discover our handpicked selection of exceptional handcrafted pieces
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No featured products available at the moment</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
