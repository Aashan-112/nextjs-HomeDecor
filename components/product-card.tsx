"use client"

import { getImageSrc } from "@/lib/utils/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { Heart, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useState } from "react"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

  export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart()
    const { toggleItem, isInWishlist } = useWishlist()
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
    const discountPercentage = hasDiscount
      ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
      : 0

    const handleAddToCart = async () => {
      setIsAddingToCart(true)
      try {
        await addItem(product.id)
        toast.success(`Added ${product.name} to cart`)
      } catch (error) {
        console.error("Error adding to cart:", error)
        if (error instanceof Error && error.message.includes("logged in")) {
          toast.error("Please sign in to add items to cart")
        } else {
          toast.error("Failed to add item to cart")
        }
      } finally {
        setIsAddingToCart(false)
      }
    }

    const handleToggleWishlist = async () => {
      setIsTogglingWishlist(true)
      try {
        await toggleItem(product.id)
        const inWishlist = isInWishlist(product.id)
        toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist")
      } catch (error) {
        console.error("Error toggling wishlist:", error)
        toast.error("Please sign in to manage your wishlist")
      } finally {
        setIsTogglingWishlist(false)
      }
    }

    const inWishlist = isInWishlist(product.id)

    return (
      <AnimatedContainer animation="slideUp" className="h-full">
        <Card className="group overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover-lift h-full">
          <div className="relative overflow-hidden">
            <AspectRatio ratio={4 / 3}>
              <img
                src={getImageSrc(product.images?.[0])}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </AspectRatio>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground hover-scale animate-fadeInLeft animate-delay-300">
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="bg-black text-white hover-scale animate-fadeInLeft animate-delay-500">
                -{discountPercentage}%
              </Badge>
            )}
            {product.stock_quantity === 0 && (
              <Badge variant="outline" className="bg-background/90 hover-scale animate-fadeInLeft animate-delay-300">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover-scale hover-glow animate-fadeInRight animate-delay-300"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-pressed={isInWishlist(product?.id || "")}
            aria-label={isInWishlist(product?.id || "") ? "Remove from wishlist" : "Add to wishlist"}
          >
          <Heart className={`h-4 w-4 transition-colors ${isInWishlist(product?.id || "") ? "fill-current text-[#f5c6a5] animate-bounce-soft" : ""}`} />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-medium text-foreground hover:text-foreground/80 transition-colors line-clamp-2 hover:underline">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>

            {product.materials.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.materials.slice(0, 2).map((material, index) => (
                  <Badge key={material} variant="outline" className={`text-xs hover-scale transition-all animate-fadeInUp animate-delay-${(index + 3) * 100}`}>
                    {material}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-lift transition-all duration-300"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAddingToCart}
          >
            <ShoppingCart className={`h-4 w-4 mr-2 transition-transform ${isAddingToCart ? "animate-spin" : ""}`} />
            {isAddingToCart ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </AnimatedContainer>
    )
  }