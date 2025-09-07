"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Product } from "@/lib/types"

interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

interface WishlistContextType {
  items: WishlistItem[]
  itemsCount: number
  isInWishlist: (productId: string) => boolean
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch wishlist items when user changes
  useEffect(() => {
    if (user) {
      fetchWishlistItems()
    } else {
      setItems([])
    }
  }, [user])

  // Realtime updates for wishlist_items
  useEffect(() => {
    if (!user) return

    let channel: any
    let supabase: any
    try {
      supabase = createClient()
      channel = supabase
        .channel(`wishlist_items_user_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wishlist_items', filter: `user_id=eq.${user.id}` },
          () => {
            fetchWishlistItems()
          }
        )
        .subscribe()
    } catch (e) {
      console.error('Failed to subscribe to wishlist realtime:', e)
    }

    return () => {
      try {
        if (supabase && channel) {
          supabase.removeChannel(channel)
        }
      } catch {}
    }
  }, [user])

  const fetchWishlistItems = async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          *,
          product:products!wishlist_items_product_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: string) => {
    if (!user) throw new Error("User must be logged in")

    try {
      const supabase = createClient()
      const { error } = await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (error) throw error
      await fetchWishlistItems()
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
  }

  const removeItem = async (productId: string) => {
    if (!user) throw new Error("User must be logged in")

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)

      if (error) throw error
      await fetchWishlistItems()
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
  }

  const toggleItem = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeItem(productId)
    } else {
      await addItem(productId)
    }
  }

  const clearWishlist = async () => {
    if (!user) throw new Error("User must be logged in")

    try {
      const supabase = createClient()
      const { error } = await supabase.from("wishlist_items").delete().eq("user_id", user.id)

      if (error) throw error
      setItems([])
    } catch (error) {
      console.error("Error clearing wishlist:", error)
      throw error
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.product_id === productId)
  }

  const value: WishlistContextType = {
    items,
    itemsCount: items.length,
    isInWishlist,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    loading,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
