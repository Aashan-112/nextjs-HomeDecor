"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useWishlist } from "@/contexts/wishlist-context"

export default function WishlistPage() {
  const { user } = useAuth()
  const { items, loading, clearWishlist } = useWishlist()

    // Wishlist data comes from context - no additional setup needed

    if (loading) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
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
          </main>
          <Footer />
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {user ? "My Wishlist" : "Guest Wishlist"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {items.length === 0
                  ? "Save your favorite items for later"
                  : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
              </p>
              {!user && items.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  💡 <Link href="/auth/sign-up" className="underline hover:text-foreground">
                    Create an account
                  </Link> to save your wishlist permanently
                </p>
              )}
            </div>
            {items.length > 0 && (
              <Button variant="outline" onClick={clearWishlist}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty Wishlist */
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {user ? "Your wishlist is empty" : "Your guest wishlist is empty"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Browse our collection and save your favorite handcrafted pieces to your wishlist
              </p>
              <Button size="lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            /* Wishlist Items */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => <ProductCard key={item.id} product={item.product} />)}
            </div>
          )}

          {/* Recently Viewed or Recommendations */}
          {items.length === 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-semibold text-foreground mb-6">You might also like</h3>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  <Link href="/featured" className="text-primary hover:underline">
                    Check out our featured products
                  </Link>
                </p>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    )
  }