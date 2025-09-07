import { createClient } from "@/lib/supabase/client"
import { createAnonymousClient } from "@/lib/supabase/anonymous"
import { CATEGORIES, ALL_PRODUCTS } from "./products-data"
import type { Product, Category } from "@/lib/types"

export class ProductDataManager {
  private supabase = createClient()

  async syncCategoriesToDatabase(): Promise<void> {
    try {
      // Fetch existing categories (id + name) to support updates without unique constraints
      const { data: existingCategories, error: fetchError } = await this.supabase
        .from("categories")
        .select("id, name")

      if (fetchError) {
        console.error("Failed to fetch categories:", fetchError)
        throw fetchError
      }

      const nameToId = new Map((existingCategories || []).map((c: any) => [c.name, c.id]))

      // Build upsert payload: include id for existing (updates), omit id for new (inserts)
      const payload = CATEGORIES.map((cat) => {
        const existingId = nameToId.get(cat.name)
        return existingId ? { id: existingId, ...cat } : { ...cat }
      })

      const { error: upsertError } = await this.supabase.from("categories").upsert(payload)

      if (upsertError) {
        console.error("Error upserting categories:", upsertError)
        throw upsertError
      }

      console.log(`Synced ${payload.length} categories to database (inserted or updated)`) 
    } catch (error) {
      console.error("Failed to sync categories:", error)
      throw error
    }
  }

  async syncProductsToDatabase(): Promise<void> {
    try {
      // Get categories (id + name) to assign category_id
      const { data: categories, error: catError } = await this.supabase
        .from("categories")
        .select("id, name")

      if (catError) {
        console.error("Failed to fetch categories:", catError)
        throw catError
      }

      if (!categories || categories.length === 0) {
        throw new Error("No categories found. Please sync categories first.")
      }

      // Get existing products (id, sku, category_id) so we can update and preserve category assignment
      const { data: existingProducts, error: prodFetchError } = await this.supabase
        .from("products")
        .select("id, sku, category_id")

      if (prodFetchError) {
        console.error("Failed to fetch products:", prodFetchError)
        throw prodFetchError
      }

      const skuToExisting = new Map((existingProducts || []).map((p: any) => [p.sku, { id: p.id, category_id: p.category_id }]))

      // Build upsert payload for all products
      const productsPayload = ALL_PRODUCTS.map((product, index) => {
        const existing = skuToExisting.get(product.sku)
        // Preserve existing category_id if present; otherwise distribute round-robin
        const categoryIndex = index % categories.length
        const fallbackCategoryId = categories[categoryIndex].id
        const category_id = existing?.category_id ?? fallbackCategoryId

        return {
          ...(existing ? { id: existing.id } : {}),
          ...product,
          category_id,
        }
      })

      const { error: upsertError } = await this.supabase.from("products").upsert(productsPayload)

      if (upsertError) {
        console.error("Error upserting products:", upsertError)
        throw upsertError
      }

      console.log(`Synced ${productsPayload.length} products to database (inserted or updated)`) 
    } catch (error) {
      console.error("Failed to sync products:", error)
      throw error
    }
  }

  async getHybridProducts(): Promise<Product[]> {
    try {
      // Force fresh fetch with cache-busting
      const timestamp = Date.now()
      const res = await fetch(`/api/public/products?t=${timestamp}`, { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const products = (await res.json()) as Product[]
      console.log(`✅ Fetched ${products.length} products from API`)
      return products
    } catch (e) {
      console.error("❌ API fetch failed, trying direct service role fetch:", e)
      
      // Instead of using anonymous client, try to use a direct API call to bypass RLS
      try {
        const timestamp = Date.now()
        const res = await fetch(`/api/public/products?bypass=true&t=${timestamp}`, { 
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
        if (res.ok) {
          const products = (await res.json()) as Product[]
          console.log(`✅ Fallback fetch successful: ${products.length} products`)
          return products
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError)
      }
      
      // Last resort: return empty array instead of using anonymous client
      console.error("❌ All fetch attempts failed, returning empty array")
      return []
    }
  }

  async getHybridCategories(): Promise<Category[]> {
    try {
      const res = await fetch("/api/public/categories", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as Category[]
    } catch (e) {
      console.error("API fetch failed, falling back to direct client fetch:", e)
      const supabase = createAnonymousClient()
      const { data, error } = await supabase.from("categories").select("*").order("name")
      if (error) return []
      return data || []
    }
  }

  private getFileDataWithMockIds(): Product[] {
    const now = new Date().toISOString()
    const categories = this.getCategoriesWithMockIds()

    return ALL_PRODUCTS.map((product, index) => ({
      ...product,
      id: `mock-product-${index + 1}`,
      category_id: categories[index % categories.length].id,
      created_at: now,
      updated_at: now,
    }))
  }

  private getCategoriesWithMockIds(): Category[] {
    const now = new Date().toISOString()

    return CATEGORIES.map((category, index) => ({
      ...category,
      id: `mock-category-${index + 1}`,
      created_at: now,
      updated_at: now,
    }))
  }

  async syncAllData(): Promise<void> {
    console.log("Starting data synchronization...")
    await this.syncCategoriesToDatabase()
    await this.syncProductsToDatabase()
    console.log("Data synchronization completed!")
  }
}

// Singleton instance
export const dataManager = new ProductDataManager()

// Convenience functions
export async function getProducts(): Promise<Product[]> {
  return dataManager.getHybridProducts()
}

export async function getCategories(): Promise<Category[]> {
  return dataManager.getHybridCategories()
}

export async function getFeaturedProductsHybrid(): Promise<Product[]> {
  try {
    const res = await fetch("/api/public/featured-products", { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as Product[]
  } catch (e) {
    console.error("API fetch failed, falling back to direct client fetch:", e)
    const supabase = createAnonymousClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
    if (error) return []
    return data || []
  }
}

export async function syncDataToDatabase(): Promise<void> {
  return dataManager.syncAllData()
}
