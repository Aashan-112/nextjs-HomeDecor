"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

// Local cart item for localStorage (guest users)
interface LocalCartItem {
  id: string
  product_id: string
  quantity: number
  created_at: string
}

// Cart item with product data for UI
interface CartItemWithProduct {
  id: string
  product_id: string
  quantity: number
  created_at: string
  product: Product
}

interface CartContextType {
  items: CartItemWithProduct[]
  itemsCount: number
  totalAmount: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// localStorage utilities
const CART_STORAGE_KEY = 'guest-cart-items'

function getLocalCartItems(): LocalCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
    return []
  }
}

function saveLocalCartItems(items: LocalCartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate derived values
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

  // Load cart items from localStorage on component mount
  useEffect(() => {
    loadCartItems()
  }, [])

  async function loadCartItems() {
    setLoading(true)
    try {
      const localItems = getLocalCartItems()
      
      if (localItems.length === 0) {
        setItems([])
        return
      }

      // Fetch product details for each cart item
      const supabase = createClient()
      const productIds = localItems.map(item => item.product_id)
      
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true)

      if (error) {
        console.error("Error fetching products:", error)
        setItems([])
        return
      }

      // Combine cart items with product data
      const itemsWithProducts: CartItemWithProduct[] = localItems
        .map(cartItem => {
          const product = products?.find(p => p.id === cartItem.product_id)
          if (!product) return null
          
          // Normalize product data
          const normalizedProduct: Product = {
            ...product,
            price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
            compare_at_price:
              product.compare_at_price == null
                ? undefined
                : typeof product.compare_at_price === "string"
                ? parseFloat(product.compare_at_price)
                : product.compare_at_price,
            weight:
              product.weight == null
                ? undefined
                : typeof product.weight === "string"
                ? parseFloat(product.weight)
                : product.weight,
            images: Array.isArray(product.images) ? product.images : product.images ? [product.images] : [],
            materials: Array.isArray(product.materials) ? product.materials : product.materials ? [product.materials] : [],
            colors: Array.isArray(product.colors) ? product.colors : product.colors ? [product.colors] : [],
          }
          
          return {
            ...cartItem,
            product: normalizedProduct
          }
        })
        .filter((item): item is CartItemWithProduct => item !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setItems(itemsWithProducts)
      
      // Clean up localStorage if any products were removed/inactive
      if (itemsWithProducts.length !== localItems.length) {
        const validItems = itemsWithProducts.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          created_at: item.created_at
        }))
        saveLocalCartItems(validItems)
      }
    } catch (error) {
      console.error("Error loading cart items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function addItem(productId: string, quantity = 1) {
    try {
      const localItems = getLocalCartItems()
      const existingItemIndex = localItems.findIndex(item => item.product_id === productId)
      
      let updatedItems: LocalCartItem[]
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...localItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        }
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          id: generateCartItemId(),
          product_id: productId,
          quantity,
          created_at: new Date().toISOString()
        }
        updatedItems = [newItem, ...localItems]
      }
      
      saveLocalCartItems(updatedItems)
      await loadCartItems()
    } catch (error) {
      console.error("Error adding item to cart:", error)
      throw error
    }
  }

  async function removeItem(itemId: string) {
    try {
      const localItems = getLocalCartItems()
      const updatedItems = localItems.filter(item => item.id !== itemId)
      
      saveLocalCartItems(updatedItems)
      await loadCartItems()
    } catch (error) {
      console.error("Error removing item from cart:", error)
      throw error
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }

      const localItems = getLocalCartItems()
      const updatedItems = localItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
      
      saveLocalCartItems(updatedItems)
      await loadCartItems()
    } catch (error) {
      console.error("Error updating item quantity:", error)
      throw error
    }
  }

  function clearCart() {
    saveLocalCartItems([])
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
