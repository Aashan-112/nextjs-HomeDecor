"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save, X, Plus } from "lucide-react"

interface Category {
  id: string
  name: string
}

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
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  created_at: string
  updated_at: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    sku: "",
    stock_quantity: "",
    category_id: "",
    is_active: true,
    is_featured: false,
    images: [] as string[],
    materials: [] as string[],
    colors: [] as string[],
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: ""
    }
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        console.log('🔍 Fetching product for editing...', params.id)
        const response = await fetch(`/api/admin/products/${params.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }

        const productData: Product = await response.json()
        console.log('✅ Product fetched:', productData)
        
        setProduct(productData)
        
        // Populate form with existing data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          compare_at_price: productData.compare_at_price?.toString() || "",
          sku: productData.sku || "",
          stock_quantity: productData.stock_quantity?.toString() || "0",
          category_id: productData.category_id || "",
          is_active: productData.is_active ?? true,
          is_featured: productData.is_featured ?? false,
          images: productData.images || [],
          materials: productData.materials || [],
          colors: productData.colors || [],
          weight: productData.weight?.toString() || "",
          dimensions: {
            length: productData.dimensions?.length?.toString() || "",
            width: productData.dimensions?.width?.toString() || "",
            height: productData.dimensions?.height?.toString() || ""
          }
        })
      } catch (error: any) {
        console.error('❌ Error fetching product:', error)
        alert(`Error loading product: ${error.message}`)
        router.push('/admin/products')
      } finally {
        setFetchLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('🏷️ Fetching categories...')
        
        const response = await fetch('/api/public/categories', {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Categories fetched:', data)
          setCategories(data || [])
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (error) {
        console.log('⚠️ API failed, trying direct client...', error)
        
        const supabase = createClient()
        const { data, error: supabaseError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name")
        
        if (supabaseError) {
          console.error('❌ Categories fetch error:', supabaseError)
        } else {
          console.log('✅ Categories fetched via client:', data)
        }
        
        setCategories(data || [])
      }
    }
    fetchCategories()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addMaterial = (material: string) => {
    if (material.trim() && !formData.materials.includes(material.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, material.trim()]
      }))
    }
  }

  const removeMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material)
    }))
  }

  const addColor = (color: string) => {
    if (color.trim() && !formData.colors.includes(color.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, color.trim()]
      }))
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }))
  }

  const addImage = (imageUrl: string) => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }))
    }
  }

  const removeImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Basic validation
      if (!formData.name || !formData.price || !formData.sku) {
        alert("Please fill in all required fields")
        return
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id && formData.category_id.trim() !== "" ? formData.category_id : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: formData.images,
        materials: formData.materials,
        colors: formData.colors,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.length || formData.dimensions.width || formData.dimensions.height ? {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null
        } : null
      }

      console.log('💾 Updating product:', productData)
      
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.id,
          updates: productData
        }),
        credentials: 'include'
      })
      
      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', response.status, errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `Failed to update product (${response.status})`)
        } catch {
          throw new Error(`Failed to update product: ${response.status} - ${errorText}`)
        }
      }

      alert("Product updated successfully!")
      router.push(`/admin/products/${params.id}`)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      console.error('Error updating product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Loading..." description="Please wait..." />
        <main className="flex-1 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Error" description="Product not found" />
        <main className="flex-1 p-6">
          <Card className="max-w-2xl">
            <CardContent className="p-6">
              <p className="text-red-600">Product not found</p>
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
        title={`Edit ${product.name}`} 
        description="Update product details"
        action={
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/products/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Compare at Price</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={(e) => handleInputChange('compare_at_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory & Category</CardTitle>
              <CardDescription>Manage stock and categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => handleInputChange('category_id', value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categories.length === 0 ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Update images to showcase your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image URLs</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addImage(input.value)
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                      if (input?.value.trim()) {
                        addImage(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((image, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <img src={image} alt="Product" className="w-4 h-4 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        {image.substring(0, 30)}...
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeImage(image)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materials and Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Materials & Colors</CardTitle>
              <CardDescription>Update materials used and available colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Materials */}
                <div className="space-y-2">
                  <Label>Materials</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Cotton, Wood, Metal"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            addMaterial(input.value)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                        if (input?.value.trim()) {
                          addMaterial(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.materials.map((material, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {material}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500" 
                            onClick={() => removeMaterial(material)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label>Colors</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Red, Blue, Natural"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            addColor(input.value)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                        if (input?.value.trim()) {
                          addColor(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {color}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500" 
                            onClick={() => removeColor(color)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Properties</CardTitle>
              <CardDescription>Update weight and dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length (inches)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.length}
                    onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, length: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.width}
                    onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, width: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.height}
                    onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, height: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Settings</CardTitle>
              <CardDescription>Configure product visibility and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Product</Label>
                  <div className="text-sm text-muted-foreground">
                    Make this product visible to customers
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Product</Label>
                  <div className="text-sm text-muted-foreground">
                    Show this product in featured sections
                  </div>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/products/${params.id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
