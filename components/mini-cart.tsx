"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function MiniCart() {
  const { items, itemsCount, totalAmount, updateQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checkoutItemId, setCheckoutItemId] = useState<string | null>(null)

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity)
    } catch (error) {
      toast.error("Failed to update quantity")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId)
      toast.success("Item removed from cart")
    } catch (error) {
      toast.error("Failed to remove item")
    }
  }

  const handleIndividualCheckout = (itemId: string) => {
    setCheckoutItemId(itemId)
    // Store the single item for checkout in localStorage
    const item = items.find(i => i.id === itemId)
    if (item) {
      localStorage.setItem('checkout_item', JSON.stringify(item))
      setOpen(false)
      router.push(`/checkout?single=${itemId}`)
    }
  }

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/auth/login">
          <ShoppingCart className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {itemsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemsCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => setOpen(false)} asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 -mx-6 px-6 max-h-[60vh] mini-cart-scroll">
              <div className="space-y-3 py-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/placeholder.jpg?height=64&width=64&query=product"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">PKR {item.product.price.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Total: PKR {(item.product.price * item.quantity).toFixed(0)}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm px-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Individual Checkout Button */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => handleIndividualCheckout(item.id)}
                        disabled={checkoutItemId === item.id}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        {checkoutItemId === item.id ? 'Processing...' : 'Buy This Item'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total ({itemsCount} items)</span>
                <span className="font-bold text-lg">PKR {totalAmount.toFixed(0)}</span>
              </div>

              <Separator />
              
              <div className="text-center text-xs text-muted-foreground">
                <p>💡 You can checkout individual items or all at once</p>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => setOpen(false)} asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Full Cart
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-primary/5 border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                  onClick={() => setOpen(false)} 
                  asChild
                >
                  <Link href="/checkout">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout All Items
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
