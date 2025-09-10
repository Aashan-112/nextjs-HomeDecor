"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product, Category } from "@/lib/types"
import { Search, Filter, X, RefreshCw, Bell } from "lucide-react"
import { getProducts, getCategories as getHybridCategories } from "@/lib/data/data-sync"
import { useToast } from "@/hooks/use-toast"
import { useProductStream } from "@/hooks/use-product-stream"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { PageTransition } from "@/components/ui/page-transition"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<string>("all")
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date())
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [hasNewProducts, setHasNewProducts] = useState(false)
  const { toast } = useToast()
  
  // Real-time SSE connection for instant updates
  const { isConnected: isStreamConnected } = useProductStream({
    onNewProduct: (product) => {
      console.log('🎉 New product received via SSE:', product)
      setHasNewProducts(true)
      toast({
        title: "🎉 New Product Added!",
        description: `"${product.name}" is now available immediately!`,
        duration: 6000,
      })
      // Refresh products to show the new one instantly
      fetchProductsData(true)
    },
    onProductUpdate: (product) => {
      console.log('🔄 Product updated via SSE:', product)
      toast({
        title: "🔄 Product Updated!",
        description: `"${product.name}" has been updated!`,
        duration: 4000,
      })
      fetchProductsData(true)
    },
    onConnected: () => {
      console.log('✅ Connected to real-time product updates')
      toast({
        title: "✅ Live Updates Active!",
        description: "You'll see new products instantly without refreshing.",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('❌ Real-time connection error:', error)
    }
  })

  const availableMaterials = Array.from(new Set(products.flatMap((p) => p.materials))).sort()
  const availableColors = Array.from(new Set(products.flatMap((p) => p.colors))).sort()

  // Fetch categories once (hybrid API)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getHybridCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Initial product fetch
  useEffect(() => {
    console.log('🚀 Initial product fetch starting...')
    fetchProductsData(false)
  }, [])

  // Auto-refresh products every 5 seconds for real-time updates
  useEffect(() => {
    if (!autoRefreshEnabled) return
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing products in background...')
      fetchProductsData(true) // Silent background refresh
    }, 1000) // 1 second as SSE fallback
    
    return () => clearInterval(interval)
  }, [autoRefreshEnabled, products.length])

  // Focus-based refresh - refresh when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetchTime.getTime()
      if (timeSinceLastFetch > 60000) { // If more than 1 minute since last fetch
        console.log('🔍 Tab focused - checking for updates...')
        fetchProductsData(true)
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [lastFetchTime])

  // Client-side filtering and sorting to align with hybrid data fetching
  const filteredProducts = products
    .filter((p) => {
      if (searchQuery && !(
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return false
      }
      if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false
      switch (priceRange) {
        case "under-50":
          if (!(p.price < 50)) return false
          break
        case "50-100":
          if (!(p.price >= 50 && p.price <= 100)) return false
          break
        case "100-200":
          if (!(p.price >= 100 && p.price <= 200)) return false
          break
        case "over-200":
          if (!(p.price > 200)) return false
          break
      }
      if (selectedMaterials.length > 0 && !selectedMaterials.some((m) => p.materials?.includes(m))) return false
      if (selectedColors.length > 0 && !selectedColors.some((c) => p.colors?.includes(c))) return false
      if (showInStockOnly && !(p.stock_quantity > 0)) return false
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

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) => (prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]))
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setPriceRange("all")
    setSelectedMaterials([])
    setSelectedColors([])
    setShowInStockOnly(false)
  }

  const fetchProductsData = async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    setErrorMessage(null)
    
    const timestamp = Date.now()
    console.log(`🔄 ${silent ? 'Background' : 'Active'} product fetch at ${new Date().toLocaleTimeString()}...`)
    
    try {
      const apiResponse = await fetch(`/api/public/products?t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        const newProductCount = apiData?.length || 0
        const currentProductCount = products.length
        
        console.log(`✅ Fetch successful - found ${newProductCount} products (was ${currentProductCount})`)
        
        // Check if there are new products
        if (newProductCount > currentProductCount) {
          console.log('🎉 NEW PRODUCTS DETECTED! Updating UI...')
          const newProductsCount = newProductCount - currentProductCount
          
          // Clear any cached data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('products-cache')
            localStorage.removeItem('categories-cache')
            console.log('🗟️ Cleared local storage cache')
          }
          
          // Show notification for background updates
          if (silent) {
            console.log(`🔔 ${newProductsCount} new product(s) added and now visible!`)
            setHasNewProducts(true)
            
            // Show toast notification
            toast({
              title: "🎉 New Products Available!",
              description: `${newProductsCount} new product${newProductsCount > 1 ? 's' : ''} ${newProductsCount > 1 ? 'have' : 'has'} been added to our collection.`,
              duration: 5000,
            })
          }
        }
        
        setProducts(apiData || [])
        setLastFetchTime(new Date())
      } else {
        throw new Error(`API returned ${apiResponse.status}`)
      }
    } catch (error: any) {
      console.error(`❌ Fetch error:`, error)
      if (!silent) {
        setProducts([])
        setErrorMessage(error.message)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const forceRefreshProducts = () => {
    setHasNewProducts(false)
    fetchProductsData(false)
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : null,
    priceRange !== "all" ? priceRange : null,
    ...selectedMaterials,
    ...selectedColors,
    showInStockOnly ? "in-stock" : null,
  ].filter(Boolean).length

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <AnimatedContainer animation="slideDown" delay={100} className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <StaggerContainer className="space-y-2" staggerDelay={200} initialDelay={300}>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">All Products</h1>
              <p className="text-lg text-muted-foreground">
                Discover our complete collection of handcrafted home decor pieces
              </p>
            </StaggerContainer>
            <AnimatedContainer animation="slideLeft" delay={800} className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span>Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
                  <div className={`w-2 h-2 rounded-full ml-2 ${
                    isStreamConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span>Live: {isStreamConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </div>
                <span className="text-xs">
                  Last updated: {lastFetchTime.toLocaleTimeString()}
                </span>
              </div>
              
              <StaggerContainer 
                className="flex items-center gap-2" 
                staggerDelay={100} 
                initialDelay={1000}
                animation="scale"
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className="text-xs hover-scale transition-all"
                >
                  {autoRefreshEnabled ? '⏸️ Pause' : '▶️ Resume'} Auto-refresh
                </Button>
                
                <Button 
                  variant={hasNewProducts ? "default" : "outline"} 
                  onClick={forceRefreshProducts} 
                  disabled={loading}
                  className={`hover-lift transition-all ${hasNewProducts ? "animate-pulse shadow-lg hover-glow" : ""}`}
                >
                  {hasNewProducts && <Bell className="h-4 w-4 mr-2 animate-bounce" />}
                  <RefreshCw className={`h-4 w-4 mr-2 transition-transform ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : hasNewProducts ? 'View New Products!' : 'Refresh'}
                </Button>
                
                <Button variant="ghost" className="hover-scale transition-all" onClick={() => {
                  setProducts([])
                  setCategories([])
                  clearAllFilters()
                  window.location.reload()
                }}>
                  Hard Reset
                </Button>
              </StaggerContainer>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>

        {/* Filters */}
        <AnimatedContainer animation="slideUp" delay={500} className="mb-8 space-y-4">
          {/* Search and Filter Toggle */}
          <StaggerContainer 
            className="flex flex-col sm:flex-row gap-4" 
            staggerDelay={200} 
            initialDelay={200}
            animation="slideUp"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 hover-glow focus:scale-[1.02] transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)} 
              className="sm:w-auto hover-lift transition-all duration-300"
            >
              <Filter className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </StaggerContainer>

          {showFilters && (
            <AnimatedContainer 
              animation="slideDown" 
              className="border rounded-lg p-4 space-y-4 bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <StaggerContainer 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" 
                staggerDelay={100} 
                animation="slideUp"
              >
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="hover-glow focus:scale-[1.02] transition-all">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="hover-glow focus:scale-[1.02] transition-all">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="over-200">Over $200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="hover-glow focus:scale-[1.02] transition-all">
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

                {/* Stock Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="in-stock"
                      checked={showInStockOnly}
                      onCheckedChange={(checked) => setShowInStockOnly(checked === true)}
                      className="hover-scale transition-transform"
                    />
                    <label htmlFor="in-stock" className="text-sm">
                      In Stock Only
                    </label>
                  </div>
                </div>
              </StaggerContainer>

              {/* Material and Color Filters */}
              <StaggerContainer 
                className="grid grid-cols-1 md:grid-cols-2 gap-4" 
                staggerDelay={150} 
                animation="slideUp"
              >
                {/* Materials */}
                {availableMaterials.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Materials</label>
                    <div className="flex flex-wrap gap-2">
                      {availableMaterials.map((material) => (
                        <Badge
                          key={material}
                          variant={selectedMaterials.includes(material) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-accent hover-scale transition-all"
                          onClick={() => toggleMaterial(material)}
                        >
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <Badge
                          key={color}
                          variant={selectedColors.includes(color) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-accent hover-scale transition-all"
                          onClick={() => toggleColor(color)}
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </StaggerContainer>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <AnimatedContainer animation="fade" delay={200} className="flex justify-end">
                  <Button variant="ghost" className="hover-lift transition-all" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-2 transition-transform hover:rotate-90" />
                    Clear All Filters
                  </Button>
                </AnimatedContainer>
              )}
            </AnimatedContainer>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <StaggerContainer 
              className="flex flex-wrap gap-2" 
              staggerDelay={50} 
              animation="scale"
            >
              {searchQuery && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground hover-scale transition-all">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-accent-foreground/80 transition-colors">
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Category: {categories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("all")} className="ml-2 hover:text-accent-foreground/80">
                    ×
                  </button>
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Price: {priceRange.replace("-", " - $").replace("under", "Under $").replace("over", "Over $")}
                  <button onClick={() => setPriceRange("all")} className="ml-2 hover:text-accent-foreground/80">
                    ×
                  </button>
                </Badge>
              )}
              {selectedMaterials.map((material) => (
                <Badge key={material} variant="secondary" className="bg-accent text-accent-foreground">
                  Material: {material}
                  <button onClick={() => toggleMaterial(material)} className="ml-2 hover:text-accent-foreground/80">
                    ×
                  </button>
                </Badge>
              ))}
              {selectedColors.map((color) => (
                <Badge key={color} variant="secondary" className="bg-accent text-accent-foreground">
                  Color: {color}
                  <button onClick={() => toggleColor(color)} className="ml-2 hover:text-accent-foreground/80">
                    ×
                  </button>
                </Badge>
              ))}
              {showInStockOnly && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  In Stock Only
                  <button onClick={() => setShowInStockOnly(false)} className="ml-2 hover:text-accent-foreground/80">
                    ×
                  </button>
                </Badge>
              )}
            </StaggerContainer>
          )}
        </AnimatedContainer>

        {/* Results */}
        <AnimatedContainer animation="slideUp" delay={700} className="mb-6 space-y-2">
          {errorMessage ? (
            <p className="text-red-600">Failed to load products: {errorMessage}</p>
          ) : (
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `Showing ${filteredProducts.length} of ${products.length} products`}
            </p>
          )}
          
          {/* Debug info */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Debug Info (click to expand)</summary>
            <div className="mt-2 p-2 bg-muted/20 rounded text-xs">
              <p><strong>Total products loaded:</strong> {products.length}</p>
              <p><strong>Filtered products:</strong> {filteredProducts.length}</p>
              <p><strong>Latest product:</strong> {products[0]?.name || 'None'} (Created: {products[0]?.created_at ? new Date(products[0].created_at).toLocaleString() : 'N/A'})</p>
              <p><strong>Search query:</strong> "{searchQuery}"</p>
              <p><strong>Selected category:</strong> {selectedCategory}</p>
              <p><strong>Active filters:</strong> {activeFiltersCount}</p>
              <button 
                onClick={() => console.log('All products:', products)} 
                className="mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
              >
                Log all products to console
              </button>
            </div>
          </details>
        </AnimatedContainer>

        {/* Products Grid */}
        {loading ? (
          <StaggerContainer 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            staggerDelay={50} 
            animation="scale"
          >
            {Array.from({ length: 12 }).map((_, i) => (
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
        ) : filteredProducts.length > 0 ? (
          <StaggerContainer 
            key={filteredProducts.length} // Force re-render when products change
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            staggerDelay={100} 
            animation="slideUp"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerContainer>
        ) : (
          <AnimatedContainer animation="scale" className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No products found matching your criteria</p>
            <Button variant="outline" className="hover-lift transition-all" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </AnimatedContainer>
        )}
      </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
