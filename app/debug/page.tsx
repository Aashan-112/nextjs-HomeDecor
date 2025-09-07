"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/product')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Error fetching debug info:', error)
    }
  }

  const createTestProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/product', { method: 'POST' })
      const data = await response.json()
      console.log('Test product creation result:', data)
      alert(data.success ? 'Test product created successfully!' : `Error: ${data.error}`)
      fetchDebugInfo() // Refresh debug info
    } catch (error) {
      console.error('Error creating test product:', error)
      alert('Error creating test product')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/public/featured-products')
      const data = await response.json()
      console.log('Featured products:', data)
      setFeaturedProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
    }
  }

  const markProductAsFeatured = async () => {
    if (!debugInfo?.latest_product?.id) {
      alert('No product to mark as featured')
      return
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: debugInfo.latest_product.id,
          updates: { is_featured: true }
        })
      })
      
      if (response.ok) {
        alert('Product marked as featured!')
        fetchDebugInfo()
        fetchFeaturedProducts()
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error marking product as featured:', error)
      alert('Error marking product as featured')
    }
  }

  useEffect(() => {
    fetchDebugInfo()
    fetchFeaturedProducts()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Debug: Materials/Colors & Featured Products</h1>

      <Card>
        <CardHeader>
          <CardTitle>Product Creation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={fetchDebugInfo}>
              Refresh Debug Info
            </Button>
            <Button onClick={createTestProduct} disabled={loading}>
              {loading ? 'Creating...' : 'Create Test Product'}
            </Button>
            <Button onClick={markProductAsFeatured} variant="outline">
              Mark Latest as Featured
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Latest Product Status:</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Badge variant={debugInfo.has_materials ? "default" : "destructive"}>
                      Materials: {debugInfo.has_materials ? "✅ Saved" : "❌ Missing"}
                    </Badge>
                    {debugInfo.materials.length > 0 && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {debugInfo.materials.join(", ")}
                      </div>
                    )}
                  </div>
                  <div>
                    <Badge variant={debugInfo.has_colors ? "default" : "destructive"}>
                      Colors: {debugInfo.has_colors ? "✅ Saved" : "❌ Missing"}
                    </Badge>
                    {debugInfo.colors.length > 0 && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {debugInfo.colors.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {debugInfo.latest_product && (
                <div>
                  <h3 className="font-medium">Latest Product Info:</h3>
                  <div className="text-sm space-y-1 mt-2">
                    <p><strong>Name:</strong> {debugInfo.latest_product.name}</p>
                    <p><strong>SKU:</strong> {debugInfo.latest_product.sku}</p>
                    <p><strong>Featured:</strong> 
                      <Badge variant={debugInfo.latest_product.is_featured ? "default" : "secondary"} className="ml-2">
                        {debugInfo.latest_product.is_featured ? "Yes" : "No"}
                      </Badge>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Products Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchFeaturedProducts} className="mb-4">
            Refresh Featured Products
          </Button>

          <div>
            <h3 className="font-medium mb-2">Featured Products Count: {featuredProducts.length}</h3>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product, index) => (
                  <Card key={product.id || index} className="border">
                    <CardContent className="p-4">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      <p className="text-sm">Price: ${product.price}</p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">Featured</Badge>
                        <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      {product.materials && product.materials.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Materials:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.materials.map((material: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.colors && product.colors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Colors:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.colors.map((color: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No featured products found</p>
                <p className="text-sm mt-2">Try marking some products as featured using the button above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {debugInfo?.error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Debug Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{debugInfo.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const { user, profile, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [manualProfile, setManualProfile] = useState<any>(null)

  const fetchDebugInfo = async () => {
    const supabase = createClient()
    
    try {
      // Get session info
      const { data: sessionData } = await supabase.auth.getSession()
      
      // Get user info  
      const { data: userData } = await supabase.auth.getUser()
      
      // Try to fetch profile directly
      let profileResult = null
      if (userData.user) {
        profileResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .maybeSingle()
      }

      setDebugInfo({
        session: sessionData.session ? {
          user_id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          expires_at: sessionData.session.expires_at
        } : null,
        user: userData.user ? {
          id: userData.user.id,
          email: userData.user.email,
          created_at: userData.user.created_at
        } : null,
        profileFetch: profileResult
      })
    } catch (error) {
      setDebugInfo({ error: error.message })
    }
  }

  const fetchManualProfile = async () => {
    if (!user) return
    
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
      
      setManualProfile({ data, error })
    } catch (error) {
      setManualProfile({ error: error.message })
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchDebugInfo()
    }
  }, [loading])

  const handleAdminRedirect = () => {
    window.location.assign("/admin")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Context Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
              <p><strong>User ID:</strong> {user?.id || "None"}</p>
              <p><strong>Email:</strong> {user?.email || "None"}</p>
              <p><strong>Profile Role:</strong> {profile?.role || "None"}</p>
              <p><strong>Profile ID:</strong> {profile?.id || "None"}</p>
              <p><strong>First Name:</strong> {profile?.first_name || "None"}</p>
              <p><strong>Last Name:</strong> {profile?.last_name || "None"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Supabase Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDebugInfo} className="mb-4">
              Fetch Debug Info
            </Button>
            {debugInfo && (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Profile Fetch</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchManualProfile} className="mb-4" disabled={!user}>
              Fetch Profile Directly
            </Button>
            {manualProfile && (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(manualProfile, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                <strong>Should redirect to admin:</strong> {profile?.role === "admin" ? "Yes" : "No"}
              </p>
              <Button onClick={handleAdminRedirect}>
                Try Admin Redirect
              </Button>
              <a href="/admin" className="block">
                <Button variant="outline" className="w-full">
                  Direct Link to Admin
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
