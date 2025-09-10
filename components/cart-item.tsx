"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { useState } from "react"

// Cart item with product data for UI (matches the context)
interface CartItemWithProduct {
  id: string
  product_id: string
  quantity: number
  created_at: string
  product: Product
}

interface CartItemProps {
  item: CartItemWithProduct
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>
  onRemove: (itemId: string) => Promise<void>
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(true)
    try {
      await onUpdateQuantity(item.id, newQuantity)
      setQuantity(newQuantity)
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await onRemove(item.id)
    } catch (error) {
      console.error("Error removing item:", error)
      setIsUpdating(false)
    }
  }

  const subtotal = item.product.price * item.quantity
  const hasDiscount = item.product.compare_at_price && item.product.compare_at_price > item.product.price

  return (
    <div className="flex gap-4 py-6 border-b border-border">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.product.images[0] || "/placeholder.jpg?height=96&width=96&query=product"}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link
              href={`/products/${item.product.id}`}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">${item.product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${item.product.compare_at_price!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Product attributes */}
            {item.product.materials.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.product.materials.slice(0, 2).map((material) => (
                  <Badge key={material} variant="outline" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stock status */}
            {item.product.stock_quantity < 10 && item.product.stock_quantity > 0 && (
              <p className="text-sm text-orange-600 mt-1">Only {item.product.stock_quantity} left in stock</p>
            )}
            {item.product.stock_quantity === 0 && <p className="text-sm text-destructive mt-1">Out of stock</p>}
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity controls and subtotal */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              min="1"
              max={item.product.stock_quantity}
              value={quantity}
              onChange={(e) => {
                const newQuantity = Number.parseInt(e.target.value) || 1
                setQuantity(newQuantity)
              }}
              onBlur={() => {
                if (quantity !== item.quantity) {
                  handleQuantityChange(quantity)
                }
              }}
              className="w-16 h-8 text-center"
              disabled={isUpdating}
            />

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.stock_quantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">${subtotal.toFixed(2)}</p>
            {item.quantity > 1 && (
              <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
