"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import type { Product, Category } from "@/lib/types"
import Image from "next/image"

export default function AdminProductsPageDebug() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Debug: Log all loading state changes
  useEffect(() => {
    console.log('📊 Loading state changed to:', loading)
  }, [loading])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [error, setError] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    console.log('🔄 useEffect triggered, loading state:', loading)
    
    async function fetchData() {
      console.log('🔍 Starting to fetch admin products data...')
      setDebugInfo('Starting fetch...')
      
      try {
        // Fetch products from admin API
        console.log('🌐 Fetching from /api/admin/products')
        setDebugInfo('Making API call...')
        const productsResponse = await fetch('/api/admin/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        console.log('📡 Products response status:', productsResponse.status)
        setDebugInfo(`Response status: ${productsResponse.status}`)
        
        if (!productsResponse.ok) {
          const errorText = await productsResponse.text()
          console.error('❌ Products API error:', productsResponse.status, errorText)
          setDebugInfo(`Error: ${productsResponse.status} - ${errorText}`)
          throw new Error(`API Error: ${productsResponse.status} - ${errorText}`)
        }
        
        setDebugInfo('Parsing JSON...')
        const productsData = await productsResponse.json()
        console.log('✅ Products data received:', productsData?.length, 'products')
        setDebugInfo(`Success: ${productsData?.length || 0} products`)
        
        if (!cancelled) {
          console.log('🎯 Setting products and clearing error')
          setProducts(productsData || [])
          setError('')
          setDebugInfo(`✅ Loaded ${productsData?.length || 0} products successfully`)
          // Explicitly set loading to false here as well
          console.log('🎯 Explicitly setting loading to false after products load')
          setLoading(false)
        }
        
        // Fetch categories separately from public API (don't let this block loading state)
        try {
          const supabase = createClient()
          console.log('🏷️ Fetching categories...')
          const { data: categoriesData, error: categoriesError } = await supabase
            .from("categories")
            .select("*")
            .order("name")
          
          if (categoriesError) {
            console.error("❌ Error fetching categories:", categoriesError)
          } else {
            console.log('🏷️ Categories data received:', categoriesData?.length, 'categories')
            if (!cancelled) {
              setCategories(categoriesData || [])
            }
          }
        } catch (categoryErr: any) {
          console.error('💥 Category fetch error (non-blocking):', categoryErr)
          // Don't let category errors block the products display
          if (!cancelled) {
            setCategories([])
          }
        }
        
      } catch (err: any) {
        console.error('💥 Error in fetchData:', err)
        setDebugInfo(`Error: ${err.message}`)
        if (!cancelled) {
          // Set empty arrays so page isn't stuck loading
          setProducts([])
          setCategories([])
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          console.log('🏁 Finally block: Setting loading to false')
          setLoading(false)
        }
      }
    }

    fetchData()
    
    // Timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!cancelled && loading) {
        console.warn('⚠️ Timeout: Forcing loading to false')
        setDebugInfo('Timeout: Forcing loading to false')
        setLoading(false)
      }
    }, 15000) // 15 second timeout
    
    // Cleanup function
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      const matchesName = product.name?.toLowerCase().includes(query)
      const matchesDescription = product.description?.toLowerCase().includes(query)
      const matchesSku = product.sku?.toLowerCase().includes(query)
      
      if (!matchesName && !matchesDescription && !matchesSku) {
        return false
      }
    }
    
    // Category filter
    if (selectedCategory !== "all" && product.category_id !== selectedCategory) {
      return false
    }
    
    // Status filter
    if (statusFilter === "active" && !product.is_active) {
      return false
    }
    if (statusFilter === "inactive" && product.is_active) {
      return false
    }
    
    return true
  })

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, updates: { is_active: false } }) // Soft delete
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error deactivating product:", errorData.error)
        return
      }

      setProducts(products.filter((p) => p.id !== productId))
    } catch (error) {
      console.error("Error deactivating product:", error)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, updates: { is_active: !currentStatus } })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating product status:", errorData.error)
        return
      }

      setProducts(products.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p)))
    } catch (error) {
      console.error("Error updating product status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Products" description="Manage your product catalog" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Products" description="Manage your product catalog" />

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Debug Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm space-y-1">
                <div><strong>Debug:</strong> {debugInfo || 'No debug info'}</div>
                <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                <div><strong>Products:</strong> {products.length}</div>
                <div><strong>Categories:</strong> {categories.length}</div>
                {error && <div className="text-red-600"><strong>Error:</strong> {error}</div>}
              </div>
            </CardContent>
          </Card>
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/categories')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => router.push('/admin/products/add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={product.images[0] || "/placeholder.jpg?height=200&width=300&query=product"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {product.is_featured && (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Badge variant={product.stock_quantity > 0 ? "outline" : "destructive"}>
                      {product.stock_quantity} in stock
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    SKU: {product.sku} • Created: {new Date(product.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-transparent"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-transparent"
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products found</p>
              <Button onClick={() => router.push('/admin/products/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
