"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminProductsPageSimple() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    
    async function fetchProducts() {
      setDebugInfo("Starting fetch...")
      console.log('🔍 Starting to fetch admin products...')
      
      try {
        setDebugInfo("Making API call...")
        console.log('🌐 Making API call to /api/admin/products')
        
        const response = await fetch('/api/admin/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        setDebugInfo(`Response status: ${response.status}`)
        console.log('📡 Response status:', response.status)
        console.log('📡 Response ok:', response.ok)
        
        if (!response.ok) {
          const errorText = await response.text()
          setDebugInfo(`Error: ${response.status} - ${errorText}`)
          console.error('❌ API Error:', response.status, errorText)
          throw new Error(`API Error: ${response.status} - ${errorText}`)
        }
        
        setDebugInfo("Parsing JSON...")
        const data = await response.json()
        
        setDebugInfo(`Success: ${data?.length || 0} products`)
        console.log('✅ Products received:', data?.length || 0, 'products')
        console.log('📦 Sample product:', data?.[0])
        
        if (!cancelled) {
          setProducts(data || [])
          setError("")
        }
        
      } catch (err: any) {
        console.error('💥 Error in fetchProducts:', err)
        setDebugInfo(`Error: ${err.message}`)
        if (!cancelled) {
          setError(err.message)
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          console.log('🏁 Setting loading to false')
          setLoading(false)
        }
      }
    }

    // Add a small delay to see if it's a timing issue
    const timer = setTimeout(() => {
      fetchProducts()
    }, 100)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  console.log('🎯 Current state:', { loading, products: products.length, error, debugInfo })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Products (Debug)" description="Debug version of products page" />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Products Count:</strong> {products.length}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
              <div><strong>Debug Info:</strong> {debugInfo || 'None'}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading products... {debugInfo}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Products Display */}
        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              <CardDescription>
                {products.length === 0 ? 'No products found' : `Found ${products.length} products`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products to display</p>
              ) : (
                <div className="space-y-4">
                  {products.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="border rounded p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                      <p className="text-sm">Stock: {product.stock_quantity}</p>
                      <p className="text-sm">Active: {product.is_active ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                  {products.length > 3 && (
                    <p className="text-sm text-muted-foreground">...and {products.length - 3} more products</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
