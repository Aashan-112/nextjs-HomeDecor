"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonSpinner } from "@/components/ui/loading-spinner"
import { Heart, ShoppingCart, ArrowLeft, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { createAnonymousClient } from "@/lib/supabase/anonymous"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import type { Product, Category } from "@/lib/types"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
        if (!id) {
          setLoading(false)
          return
        }

        // Try public API first
        let prod: Product | null = null
        try {
          const res = await fetch(`/api/public/products/${id}`, { cache: "no-store" })
          if (res.ok) {
            prod = (await res.json()) as Product
          } else if (res.status !== 404) {
            throw new Error(`HTTP ${res.status}`)
          }
        } catch (e) {
          // Fallback to direct Supabase fetch
          const supabase = createAnonymousClient()
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .eq("is_active", true)
            .single()
          if (!productError && productData) {
            const p: any = productData
            prod = {
              ...p,
              price: typeof p?.price === "string" ? parseFloat(p.price) : p.price,
              compare_at_price:
                p?.compare_at_price == null
                  ? undefined
                  : typeof p.compare_at_price === "string"
                  ? parseFloat(p.compare_at_price)
                  : p.compare_at_price,
              weight:
                p?.weight == null
                  ? undefined
                  : typeof p.weight === "string"
                  ? parseFloat(p.weight)
                  : p.weight,
            } as Product
          }
        }

        if (prod) {
          setProduct(prod)
          // Fetch category via anonymous client (public read allowed)
          if (prod.category_id) {
            const supabase = createAnonymousClient()
            const { data: categoryData, error: categoryError } = await supabase
              .from("categories")
              .select("*")
              .eq("id", prod.category_id)
              .single()
            if (!categoryError) {
              setCategory(categoryData)
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching product:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      await addItem(product.id, quantity)
      toast.success(`Added ${quantity} ${product.name}${quantity > 1 ? "s" : ""} to cart`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart. Please try again.")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!product) return

    setIsTogglingWishlist(true)
    try {
      const wasInWishlist = isInWishlist(product.id)
      await toggleItem(product.id)
      toast.success(wasInWishlist ? "Removed from wishlist" : "Added to wishlist")
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Please sign in to manage your wishlist")
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ["/handcraft-mirror.png"]

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
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/categories/${category.id}`} className="hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <AspectRatio ratio={1}>
                <Image
                  src={images[selectedImageIndex] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </AspectRatio>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive" className="bg-black text-white">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
                {product.stock_quantity === 0 && (
                  <Badge variant="outline" className="bg-background/90">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.jpg"}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {category && (
                <Link
                  href={`/categories/${category.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {product.materials.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material) => (
                      <Badge key={material} variant="outline">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.dimensions && (
                <div>
                  <h3 className="font-medium text-foreground mb-2">Dimensions</h3>
                  <p className="text-muted-foreground">
                    {product.dimensions.width && `W: ${product.dimensions.width}"`}
                    {product.dimensions.height && ` × H: ${product.dimensions.height}"`}
                    {product.dimensions.depth && ` × D: ${product.dimensions.depth}"`}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-foreground mb-2">SKU</h3>
                <p className="text-muted-foreground font-mono text-sm">{product.sku}</p>
              </div>
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <ButtonSpinner className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  aria-pressed={isInWishlist(product?.id || "")}
                  aria-label={isInWishlist(product?.id || "") ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isTogglingWishlist ? (
                    <ButtonSpinner />
                  ) : (
                    <Heart className={`h-4 w-4 ${isInWishlist(product?.id || "") ? "fill-current text-red-500" : ""}`} />
                  )}
                </Button>

                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Free Shipping</p>
                      <p className="text-sm text-muted-foreground">On orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Quality Guarantee</p>
                      <p className="text-sm text-muted-foreground">Handcrafted with care</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">30-Day Returns</p>
                      <p className="text-sm text-muted-foreground">Easy returns & exchanges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
