"use client"
  import { Header } from "@/components/header"
  import { Footer } from "@/components/footer"
  import { ProductCard } from "@/components/product-card"
  import { Button } from "@/components/ui/button"
  import { Skeleton } from "@/components/ui/skeleton"
  import { Heart, ShoppingBag, Trash2 } from "lucide-react"
  import Link from "next/link"
  import { useAuth } from "@/contexts/auth-context"
  import { createClient } from "@/lib/supabase/client"
  import { useCallback, useEffect, useState } from "react"

  interface WishlistItem {
    id: string
    user_id: string
    product_id: string
    created_at: string
    product?: any
  }

  export default function WishlistPage() {
    const { user } = useAuth()
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      let active = true
      if (!user) {
        setWishlistItems([])
        setLoading(false)
        return
      }

      setLoading(true)
      ;(async () => {
        try {
          const res = await fetch("/api/public/wishlist", { cache: "no-store" })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as WishlistItem[]
          if (active) setWishlistItems(data || [])
        } catch (e) {
          console.error("Failed to load wishlist via API:", e)
          if (active) setWishlistItems([])
        } finally {
          if (active) setLoading(false)
        }
      })()

      // Realtime subscription
      let channel: any
      let supabase: any
      try {
        supabase = createClient()
        channel = supabase
          .channel(`wishlist_page_user_${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wishlist_items', filter: `user_id=eq.${user.id}` },
            async () => {
              try {
                const res = await fetch("/api/public/wishlist", { cache: "no-store" })
                if (res.ok) {
                  const data = (await res.json()) as WishlistItem[]
                  if (active) setWishlistItems(data || [])
                }
              } catch {}
            }
          )
          .subscribe()
      } catch (e) {
        console.error('Failed to subscribe on wishlist page:', e)
      }

      return () => {
        active = false
        try {
          if (supabase && channel) supabase.removeChannel(channel)
        } catch {}
      }
    }, [user])

    const clearWishlist = useCallback(async () => {
      if (!user) return
      try {
        const supabase = createClient()
        const { error } = await supabase.from("wishlist_items").delete().eq("user_id", user.id)
        if (error) throw error
        // list will refresh via realtime
      } catch (e) {
        console.error("Failed to clear wishlist:", e)
      }
    }, [user])

    if (!user) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-16">
            <div className="text-center max-w-md mx-auto">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
              <p className="text-muted-foreground mb-8">Please sign in to view and manage your wishlist</p>
              <Button size="lg" asChild>
                <Link href="/auth/login?redirect=/wishlist">Sign In</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      )
    }

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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">My Wishlist</h1>
              <p className="text-lg text-muted-foreground">
                {wishlistItems.length === 0
                  ? "Save your favorite items for later"
                  : `${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} saved`}
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Button variant="outline" onClick={clearWishlist}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty Wishlist */
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
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
              {wishlistItems.map((item) => item.product && <ProductCard key={item.id} product={item.product} />)}
            </div>
          )}

          {/* Recently Viewed or Recommendations */}
          {wishlistItems.length === 0 && (
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