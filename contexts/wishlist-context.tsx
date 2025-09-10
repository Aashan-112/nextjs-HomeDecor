"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

// Local wishlist item for localStorage (guest users)
interface LocalWishlistItem {
  id: string
  product_id: string
  created_at: string
}

// Wishlist item with product data for UI
interface WishlistItemWithProduct {
  id: string
  product_id: string
  created_at: string
  product: Product
}

interface WishlistContextType {
  items: WishlistItemWithProduct[]
  itemsCount: number
  isInWishlist: (productId: string) => boolean
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (productId: string) => Promise<void>
  clearWishlist: () => void
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

// localStorage utilities
const WISHLIST_STORAGE_KEY = 'guest-wishlist-items'

function getLocalWishlistItems(): LocalWishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading wishlist from localStorage:', error)
    return []
  }
}

function saveLocalWishlistItems(items: LocalWishlistItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error)
  }
}

function generateWishlistItemId(): string {
  return `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Load wishlist items from localStorage on component mount
  useEffect(() => {
    loadWishlistItems()
  }, [])

  async function loadWishlistItems() {
    setLoading(true)
    try {
      const localItems = getLocalWishlistItems()
      
      if (localItems.length === 0) {
        setItems([])
        return
      }

      // Fetch product details for each wishlist item
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

      // Combine wishlist items with product data
      const itemsWithProducts: WishlistItemWithProduct[] = localItems
        .map(wishlistItem => {
          const product = products?.find(p => p.id === wishlistItem.product_id)
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
            ...wishlistItem,
            product: normalizedProduct
          }
        })
        .filter((item): item is WishlistItemWithProduct => item !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setItems(itemsWithProducts)
      
      // Clean up localStorage if any products were removed/inactive
      if (itemsWithProducts.length !== localItems.length) {
        const validItems = itemsWithProducts.map(item => ({
          id: item.id,
          product_id: item.product_id,
          created_at: item.created_at
        }))
        saveLocalWishlistItems(validItems)
      }
    } catch (error) {
      console.error("Error loading wishlist items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: string) => {
    try {
      const localItems = getLocalWishlistItems()
      const existingItem = localItems.find(item => item.product_id === productId)
      
      if (existingItem) {
        // Item already in wishlist
        return
      }
      
      // Add new item
      const newItem: LocalWishlistItem = {
        id: generateWishlistItemId(),
        product_id: productId,
        created_at: new Date().toISOString()
      }
      
      const updatedItems = [newItem, ...localItems]
      saveLocalWishlistItems(updatedItems)
      await loadWishlistItems()
    } catch (error) {
      console.error("Error adding item to wishlist:", error)
      throw error
    }
  }

  const removeItem = async (productId: string) => {
    try {
      const localItems = getLocalWishlistItems()
      const updatedItems = localItems.filter(item => item.product_id !== productId)
      
      saveLocalWishlistItems(updatedItems)
      await loadWishlistItems()
    } catch (error) {
      console.error("Error removing item from wishlist:", error)
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

  function clearWishlist() {
    saveLocalWishlistItems([])
    setItems([])
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
