"use client"

import { createClient } from "@/lib/supabase/client"

export class InventoryManager {
  private supabase = createClient()

  async updateProductStock(productId: string, quantityChange: number): Promise<void> {
    try {
      // Get current stock
      const { data: product, error: fetchError } = await this.supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single()

      if (fetchError) throw fetchError

      const newQuantity = Math.max(0, product.stock_quantity + quantityChange)

      // Update stock
      const { error: updateError } = await this.supabase
        .from("products")
        .update({ stock_quantity: newQuantity })
        .eq("id", productId)

      if (updateError) throw updateError

      console.log(`Updated product ${productId} stock: ${product.stock_quantity} → ${newQuantity}`)
    } catch (error) {
      console.error("Error updating product stock:", error)
      throw error
    }
  }

  async reserveInventory(items: { productId: string; quantity: number }[]): Promise<void> {
    try {
      for (const item of items) {
        await this.updateProductStock(item.productId, -item.quantity)
      }
    } catch (error) {
      console.error("Error reserving inventory:", error)
      throw error
    }
  }

  async releaseInventory(items: { productId: string; quantity: number }[]): Promise<void> {
    try {
      for (const item of items) {
        await this.updateProductStock(item.productId, item.quantity)
      }
    } catch (error) {
      console.error("Error releasing inventory:", error)
      throw error
    }
  }

  async checkStockAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    try {
      const { data: product, error } = await this.supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single()

      if (error) throw error

      return product.stock_quantity >= requestedQuantity
    } catch (error) {
      console.error("Error checking stock availability:", error)
      return false
    }
  }

  async getLowStockProducts(threshold = 5): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("*")
        .lte("stock_quantity", threshold)
        .eq("is_active", true)
        .order("stock_quantity", { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error fetching low stock products:", error)
      return []
    }
  }
}

export const inventoryManager = new InventoryManager()
