import { CartItem, Product, CartSummary, ShippingQuote } from './types'
import { ShippingAddress, ShippingCalculator, TaxCalculator } from './shipping'

/**
 * Cart calculation utilities with comprehensive shipping and tax support
 */
export class CartUtils {
  /**
   * Calculate comprehensive cart summary with shipping and taxes
   */
  static async calculateCartSummary(
    cartItems: CartItem[],
    products: Product[],
    shippingAddress: ShippingAddress | null = null,
    selectedShippingMethodId: string | null = null,
    shippingCalculator: ShippingCalculator | null = null
  ): Promise<CartSummary> {
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id)
      const price = product ? (product.price || 0) : 0
      return sum + (price * item.quantity)
    }, 0)

    let shippingAmount = 0
    let availableShippingMethods: ShippingQuote[] = []
    let taxAmount = 0

    // Calculate shipping if address and calculator provided
    if (shippingAddress && shippingCalculator) {
      try {
        availableShippingMethods = await shippingCalculator.calculateShipping(
          cartItems,
          products,
          shippingAddress
        )

        // Apply selected shipping method cost
        if (selectedShippingMethodId) {
          const selectedMethod = availableShippingMethods.find(
            method => method.method_id === selectedShippingMethodId
          )
          shippingAmount = selectedMethod?.cost ?? 0
        } else if (availableShippingMethods.length > 0) {
          // Use cheapest shipping method by default
          shippingAmount = availableShippingMethods[0].cost
        }

        // Calculate tax based on subtotal + shipping
        taxAmount = TaxCalculator.calculateTax(
          cartItems,
          products,
          shippingAddress
        )
      } catch (error) {
        console.error('Error calculating shipping/tax:', error)
        // Continue with zero shipping/tax amounts
      }
    }

    const totalAmount = subtotal + shippingAmount + taxAmount

    return {
      items: cartItems,
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      available_shipping_methods: availableShippingMethods,
      selected_shipping_method: selectedShippingMethodId || undefined
    }
  }

  /**
   * Validate cart items against current product data
   */
  static validateCartItems(
    cartItems: CartItem[],
    products: Product[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.product_id)
      
      if (!product) {
        errors.push(`Product with ID ${item.product_id} is no longer available`)
        continue
      }

      // Check if product is still active
      if (!product.is_active) {
        errors.push(`Product ${product.name} is no longer available`)
      }

      // Check stock availability
      if (product.stock_quantity < item.quantity) {
        if (product.stock_quantity === 0) {
          errors.push(`Product ${product.name} is out of stock`)
        } else {
          errors.push(
            `Only ${product.stock_quantity} units of ${product.name} available (requested ${item.quantity})`
          )
        }
      }

      // Price validation - could be extended to check against stored prices if needed
      // For now, we skip price change detection since CartItem doesn't store unit_price
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Update cart item prices to match current product prices
   * Note: CartItem doesn't store price info, this validates against current product prices
   */
  static updateCartItemPrices(
    cartItems: CartItem[],
    products: Product[]
  ): CartItem[] {
    // Since CartItem doesn't store price info, just return the items
    // Price calculations are done at checkout time using current product prices
    return cartItems
  }

  /**
   * Check if cart qualifies for free shipping
   */
  static checkFreeShippingEligibility(
    cartSummary: CartSummary,
    freeShippingThreshold: number = 100
  ): { qualifies: boolean; amountNeeded?: number } {
    if (cartSummary.subtotal >= freeShippingThreshold) {
      return { qualifies: true }
    }

    return {
      qualifies: false,
      amountNeeded: freeShippingThreshold - cartSummary.subtotal
    }
  }

  /**
   * Get shipping requirements summary for cart
   */
  static getShippingRequirements(
    cartItems: CartItem[],
    products: Product[]
  ): {
    requiresShipping: boolean
    hasDigitalItems: boolean
    hasPhysicalItems: boolean
    hasFragileItems: boolean
    hasHazardousItems: boolean
    totalWeight: number
    estimatedDimensions?: {
      length: number
      width: number
      height: number
    }
  } {
    let hasDigitalItems = false
    let hasPhysicalItems = false
    let hasFragileItems = false
    let hasHazardousItems = false
    let totalWeight = 0

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) continue

      if (product.requires_shipping === false) {
        hasDigitalItems = true
      } else {
        hasPhysicalItems = true
        
        if (product.is_fragile) {
          hasFragileItems = true
        }
        
        if (product.is_hazardous) {
          hasHazardousItems = true
        }

        const weight = product.shipping_weight ?? product.weight ?? 0
        totalWeight += weight * item.quantity
      }
    }

    return {
      requiresShipping: hasPhysicalItems,
      hasDigitalItems,
      hasPhysicalItems,
      hasFragileItems,
      hasHazardousItems,
      totalWeight
    }
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  /**
   * Calculate savings from sale prices
   */
  static calculateSavings(cartItems: CartItem[], products: Product[]): number {
    let totalSavings = 0

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.product_id)
      if (!product || !product.compare_at_price) continue

      const regularPrice = product.compare_at_price
      const salePrice = product.price
      const savingsPerItem = regularPrice - salePrice
      
      totalSavings += savingsPerItem * item.quantity
    }

    return totalSavings
  }
}
