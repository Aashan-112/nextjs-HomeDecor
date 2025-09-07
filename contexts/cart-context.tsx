"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { CartItem, Product } from "@/lib/types"

interface CartContextType {
  items: (CartItem & { product: Product })[]
  itemsCount: number
  totalAmount: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const [supabaseError, setSupabaseError] = useState(false)

  // Calculate derived values
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + ((item.product?.price ?? 0) * item.quantity), 0)

  // Load cart items when user changes
  useEffect(() => {
    if (user) {
      loadCartItems()
    } else {
      setItems([])
      setLoading(false)
    }
  }, [user])

  // Realtime updates for cart_items
  useEffect(() => {
    if (!user) return

    let channel: any
    let supabase: any
    try {
      supabase = createClient()
      channel = supabase
        .channel(`cart_items_user_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` },
          () => {
            // Always refetch to ensure joined product is included
            loadCartItems()
          }
        )
        .subscribe()
    } catch (e) {
      console.error('Failed to subscribe to cart realtime:', e)
    }

    return () => {
      try {
        if (supabase && channel) {
          supabase.removeChannel(channel)
        }
      } catch {}
    }
  }, [user])

  async function loadCartItems() {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products!cart_items_product_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        if (error.message === "Supabase not configured") {
          setSupabaseError(true)
        } else {
          console.error("Error loading cart items:", error)
        }
        setItems([] as any)
        return
      }

      const merged = (data || [])
        .map((row: any) => {
          const p = (row as any).products
          const normalizedProduct = p
            ? {
                ...p,
                price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
                compare_at_price:
                  p.compare_at_price == null
                    ? undefined
                    : typeof p.compare_at_price === "string"
                    ? parseFloat(p.compare_at_price)
                    : p.compare_at_price,
                weight:
                  p.weight == null
                    ? undefined
                    : typeof p.weight === "string"
                    ? parseFloat(p.weight)
                    : p.weight,
                images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
                materials: Array.isArray(p.materials) ? p.materials : p.materials ? [p.materials] : [],
                colors: Array.isArray(p.colors) ? p.colors : p.colors ? [p.colors] : [],
              }
            : undefined

          return {
            ...row,
            product: normalizedProduct,
            products: undefined // Remove the raw products property to avoid confusion
          }
        })
        // Filter out any orphan cart rows without a product to avoid UI crashes
        .filter((r: any) => !!r.product)

      setItems(merged as any)
    } catch (error) {
      console.error("Error loading cart items:", error)
      setSupabaseError(true)
    } finally {
      setLoading(false)
    }
  }

  async function addItem(productId: string, quantity = 1) {
    if (!user) {
      throw new Error("User must be logged in to add items to cart")
    }

    if (supabaseError) {
      throw new Error("Database not available")
    }

    try {
      const supabase = createClient()

      // Check in the database if item already exists for this user
      const { data: existing, error: selectError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()

      if (selectError) {
        throw selectError
      }

      if (existing) {
        const newQty = existing.quantity + quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQty })
          .eq("id", existing.id)

        if (updateError) {
          throw updateError
        }
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })

        if (insertError) {
          throw insertError
        }
      }

      // Also refresh from DB to keep state fully in sync
      await loadCartItems()
    } catch (error) {
      console.error("Error adding item to cart:", error)
      throw error
    }
  }

  async function removeItem(itemId: string) {
    if (supabaseError) {
      throw new Error("Database not available")
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) {
        throw error
      }

      await loadCartItems()
    } catch (error) {
      console.error("Error removing item from cart:", error)
      throw error
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (supabaseError) {
      throw new Error("Database not available")
    }

    try {
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId)

      if (error) {
        throw error
      }

      await loadCartItems()
    } catch (error) {
      console.error("Error updating item quantity:", error)
      throw error
    }
  }

  async function clearCart() {
    if (!user || supabaseError) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

      if (error) {
        throw error
      }

      setItems([])
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
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
