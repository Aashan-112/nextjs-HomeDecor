"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAnonymousClient } from "@/lib/supabase/anonymous"
import type { Product, Category } from "@/lib/types"
import { Search } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { toast } from "sonner"

export default function CategoryPage() {
  const params = useParams()
  const { toggleItem, isInWishlist } = useWishlist()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return

      const supabase = createAnonymousClient()

      // Fetch category and products in parallel
      const [categoryResult, productsResult] = await Promise.all([
        supabase.from("categories").select("*").eq("id", params.id).single(),
        supabase
          .from("products")
          .select("*")
          .eq("category_id", params.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ])

      if (categoryResult.error) {
        console.error("Error fetching category:", categoryResult.error)
      } else {
        setCategory(categoryResult.data)
      }

      if (productsResult.error) {
        console.error("Error fetching products:", productsResult.error)
      } else {
        setProducts(productsResult.data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id])

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-lg text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/categories">Browse All Categories</Link>
            </Button>
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery ? "No products found matching your search" : "No products in this category yet"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
