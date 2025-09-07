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
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)

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
      selected_shipping_method: selectedShippingMethodId
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
        errors.push(`Product ${item.product_name} is no longer available`)
        continue
      }

      // Check if product is still active
      if (product.status !== 'active') {
        errors.push(`Product ${product.name} is no longer available`)
      }

      // Check stock availability
      if (product.track_inventory && product.stock_quantity < item.quantity) {
        if (product.stock_quantity === 0) {
          errors.push(`Product ${product.name} is out of stock`)
        } else {
          errors.push(
            `Only ${product.stock_quantity} units of ${product.name} available (requested ${item.quantity})`
          )
        }
      }

      // Check price changes (optional - could notify user of price changes)
      if (Math.abs(product.price - item.unit_price) > 0.01) {
        // Price has changed - you might want to notify the user
        console.warn(`Price changed for ${product.name}: was ${item.unit_price}, now ${product.price}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Update cart item prices to match current product prices
   */
  static updateCartItemPrices(
    cartItems: CartItem[],
    products: Product[]
  ): CartItem[] {
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.product_id)
      if (!product) return item

      const updatedPrice = product.sale_price ?? product.price
      
      return {
        ...item,
        unit_price: updatedPrice,
        total_price: updatedPrice * item.quantity
      }
    })
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
      if (!product || !product.sale_price) continue

      const regularPrice = product.price
      const salePrice = product.sale_price
      const savingsPerItem = regularPrice - salePrice
      
      totalSavings += savingsPerItem * item.quantity
    }

    return totalSavings
  }
}
