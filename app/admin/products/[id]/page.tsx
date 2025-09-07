"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { ExternalImage } from "@/components/ui/external-image"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  compare_at_price?: number
  sku: string
  stock_quantity: number
  category_id?: string
  is_active: boolean
  is_featured: boolean
  images: string[]
  materials?: string[]
  colors?: string[]
  weight?: number
  dimensions?: any
  created_at: string
  updated_at: string
}

export default function ProductViewPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }

        const data = await response.json()
        setProduct(data)
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          updates: { is_active: false }
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      alert('Product deleted successfully!')
      router.push('/admin/products')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Loading..." description="Please wait..." />
        <main className="flex-1 p-6">
          <div className="max-w-4xl space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Error" description="Failed to load product" />
        <main className="flex-1 p-6">
          <Card className="max-w-2xl">
            <CardContent className="p-6">
              <p className="text-red-600">{error || 'Product not found'}</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/admin/products')}
              >
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title={product.name}
        description={`Product details for ${product.sku}`}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl space-y-6">
          {/* Product Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                  <ExternalImage
                    src={product.images[0] || "/placeholder.jpg?height=400&width=400&query=product"}
                    alt={product.name}
                    className="absolute inset-0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <CardDescription className="mt-2">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {product.is_featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Price</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Stock</h4>
                  <p className="mt-1">
                    <Badge variant={product.stock_quantity > 0 ? "outline" : "destructive"}>
                      {product.stock_quantity} in stock
                    </Badge>
                  </p>
                </div>

                {product.description && (
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="mt-1 text-muted-foreground">{product.description}</p>
                  </div>
                )}

                {product.materials && product.materials.length > 0 && (
                  <div>
                    <h4 className="font-medium">Materials</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.materials.map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h4 className="font-medium">Colors</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Created</p>
                  <p>{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Updated</p>
                  <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p>{product.category_id || "Uncategorized"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p>{product.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
