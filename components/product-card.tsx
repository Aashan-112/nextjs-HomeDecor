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
  className?: string
}

  export function ProductCard({ product, className }: ProductCardProps) {
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
        <Card className={`group overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-500 hover-lift h-full transform-gpu hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-accent/20 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm ${className || ''}`}>
          <div className="relative overflow-hidden bg-gradient-to-br from-accent/5 to-secondary/10 group-hover:from-accent/10 group-hover:to-secondary/20 transition-all duration-500">
            {/* 3D Tilt Effect Container */}
            <div className="relative transform transition-all duration-500 group-hover:[transform:perspective(1000px)_rotateY(5deg)_rotateX(2deg)]">
              {/* Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <AspectRatio ratio={4 / 3}>
                <img
                  src={getImageSrc(product.images?.[0])}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105 filter group-hover:saturate-110"
                  loading="lazy"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </AspectRatio>
            </div>

          {/* Badges */}
          <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 flex flex-col gap-1 sm:gap-2 z-20">
            {product.is_featured && (
              <Badge variant="secondary" className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover-scale animate-fadeInLeft animate-delay-300 text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 shadow-lg transform transition-all duration-300 hover:rotate-2 hover:scale-110">
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="bg-gradient-to-r from-accent to-accent/80 text-white hover-scale animate-fadeInLeft animate-delay-500 text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 shadow-lg transform transition-all duration-300 hover:-rotate-2 hover:scale-110 animate-pulse">
                -{discountPercentage}%
              </Badge>
            )}
            {product.stock_quantity === 0 && (
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm hover-scale animate-fadeInLeft animate-delay-300 text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-red-300">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 bg-background/90 backdrop-blur-sm hover-scale hover-glow animate-fadeInRight animate-delay-300 h-8 w-8 sm:h-10 sm:w-10 z-20 transform transition-all duration-300 hover:rotate-12 hover:scale-110 shadow-lg hover:shadow-accent/30"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-pressed={isInWishlist(product?.id || "")}
            aria-label={isInWishlist(product?.id || "") ? "Remove from wishlist" : "Add to wishlist"}
          >
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${isInWishlist(product?.id || "") ? "fill-current text-red-500 animate-pulse scale-110" : "hover:scale-110"}`} />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-medium text-foreground hover:text-foreground/80 transition-colors line-clamp-2 hover:underline text-sm sm:text-base">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-semibold text-foreground">PKR {product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  PKR {product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>

            {product.materials.length > 0 && (
              <div className="flex flex-wrap gap-1 hidden sm:flex">
                {product.materials.slice(0, 2).map((material, index) => (
                  <Badge key={material} variant="outline" className={`text-xs hover-scale transition-all animate-fadeInUp animate-delay-${(index + 3) * 100}`}>
                    {material}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-2 sm:p-4 pt-0">
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover-lift transition-all duration-300 h-8 sm:h-10 text-sm transform hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAddingToCart}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            
            <ShoppingCart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 transition-all duration-300 relative z-10 ${isAddingToCart ? "animate-bounce" : "group-hover:scale-110"}`} />
            <span className="hidden sm:inline relative z-10">
              {isAddingToCart ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </span>
            <span className="sm:hidden relative z-10">
              {isAddingToCart ? "Adding..." : product.stock_quantity === 0 ? "Out" : "Add"}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </AnimatedContainer>
    )
  }