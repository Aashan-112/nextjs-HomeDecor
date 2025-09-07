import { Product, CartItem, ShippingMethod, ShippingZone, ShippingQuote } from './types'

export interface ShippingAddress {
  country: string
  state?: string
  postal_code?: string
  city?: string
  address_line_1: string
  address_line_2?: string
}

export class ShippingCalculator {
  private shippingMethods: ShippingMethod[]
  private shippingZones: ShippingZone[]

  constructor(methods: ShippingMethod[], zones: ShippingZone[]) {
    this.shippingMethods = methods.filter(m => m.is_active)
    this.shippingZones = zones.filter(z => z.is_active)
  }

  /**
   * Calculate available shipping options for cart items to a destination
   */
  async calculateShipping(
    cartItems: CartItem[],
    products: Product[],
    destination: ShippingAddress
  ): Promise<ShippingQuote[]> {
    // Check if all items require shipping
    const shippableItems = cartItems.filter(item => {
      const product = products.find(p => p.id === item.product_id)
      return product?.requires_shipping !== false
    })

    if (shippableItems.length === 0) {
      return [{
        method_id: 'free',
        method_name: 'No Shipping Required',
        cost: 0
      }]
    }

    // Find applicable shipping zone
    const applicableZone = this.findApplicableZone(destination)
    if (!applicableZone) {
      throw new Error('No shipping zone found for destination')
    }

    // Get applicable shipping methods for the zone
    const applicableMethods = this.shippingMethods.filter(method => 
      method.zones.includes(applicableZone.id)
    )

    const quotes: ShippingQuote[] = []

    for (const method of applicableMethods) {
      try {
        const quote = await this.calculateMethodCost(
          method,
          shippableItems,
          products,
          destination
        )
        quotes.push(quote)
      } catch (error) {
        console.error(`Failed to calculate shipping for method ${method.id}:`, error)
        // Continue with other methods
      }
    }

    return quotes.sort((a, b) => a.cost - b.cost)
  }

  /**
   * Calculate cost for a specific shipping method
   */
  private async calculateMethodCost(
    method: ShippingMethod,
    cartItems: CartItem[],
    products: Product[],
    destination: ShippingAddress
  ): Promise<ShippingQuote> {
    const cartSubtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)

    // Check for free shipping threshold
    if (method.free_shipping_threshold && cartSubtotal >= method.free_shipping_threshold) {
      return {
        method_id: method.id,
        method_name: method.name,
        cost: 0
      }
    }

    let shippingCost = method.base_cost

    switch (method.type) {
      case 'fixed':
        // Fixed cost already set as base_cost
        break

      case 'weight_based':
        shippingCost += this.calculateWeightBasedCost(method, cartItems, products)
        break

      case 'zone_based':
        // Zone-based pricing could have different rates per zone
        // For now, use base cost (could be enhanced with zone-specific rates)
        break

      case 'carrier_calculated':
        shippingCost = await this.getCarrierRates(method, cartItems, products, destination)
        break

      case 'free':
        shippingCost = 0
        break

      default:
        throw new Error(`Unknown shipping method type: ${method.type}`)
    }

    // Add per-item costs if configured
    if (method.per_item_cost) {
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
      shippingCost += method.per_item_cost * totalItems
    }

    return {
      method_id: method.id,
      method_name: method.name,
      cost: Math.max(0, shippingCost), // Ensure non-negative
      estimated_days: this.getEstimatedDeliveryDays(method)
    }
  }

  /**
   * Calculate weight-based shipping cost
   */
  private calculateWeightBasedCost(
    method: ShippingMethod,
    cartItems: CartItem[],
    products: Product[]
  ): number {
    let totalWeight = 0

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) continue

      // Use shipping_weight if specified, otherwise use regular weight
      const itemWeight = product.shipping_weight ?? product.weight ?? 0
      totalWeight += itemWeight * item.quantity
    }

    // Check weight limit
    if (method.max_weight && totalWeight > method.max_weight) {
      throw new Error(`Total weight ${totalWeight} exceeds method limit ${method.max_weight}`)
    }

    return (method.per_weight_cost ?? 0) * totalWeight
  }

  /**
   * Get carrier-calculated rates (placeholder for real carrier API integration)
   */
  private async getCarrierRates(
    method: ShippingMethod,
    cartItems: CartItem[],
    products: Product[],
    destination: ShippingAddress
  ): Promise<number> {
    // In a real implementation, this would:
    // 1. Calculate package dimensions and weight
    // 2. Call carrier APIs (FedEx, UPS, USPS, etc.)
    // 3. Return real-time shipping rates
    
    // For now, return a calculated estimate
    const totalWeight = cartItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id)
      const weight = product?.shipping_weight ?? product?.weight ?? 1
      return sum + (weight * item.quantity)
    }, 0)

    // Mock carrier calculation - replace with real API calls
    const baseRate = method.base_cost
    const weightRate = (method.per_weight_cost ?? 1) * totalWeight
    
    return baseRate + weightRate
  }

  /**
   * Find the applicable shipping zone for a destination
   */
  private findApplicableZone(destination: ShippingAddress): ShippingZone | null {
    for (const zone of this.shippingZones) {
      // Check country
      if (zone.countries.includes(destination.country)) {
        // If zone has state restrictions, check them
        if (zone.states && zone.states.length > 0) {
          if (!destination.state || !zone.states.includes(destination.state)) {
            continue
          }
        }

        // If zone has postal code restrictions, check them
        if (zone.postal_codes && zone.postal_codes.length > 0) {
          if (!destination.postal_code) continue
          
          // Simple postal code matching - could be enhanced with ranges
          const matches = zone.postal_codes.some(pattern => 
            destination.postal_code!.startsWith(pattern)
          )
          if (!matches) continue
        }

        return zone
      }
    }

    return null
  }

  /**
   * Get estimated delivery days for a shipping method
   */
  private getEstimatedDeliveryDays(method: ShippingMethod): number | undefined {
    // This could be based on method type, carrier, destination, etc.
    // For now, return some basic estimates
    const estimates: Record<string, number> = {
      'standard': 5,
      'express': 2,
      'overnight': 1,
      'ground': 7
    }

    const methodNameLower = method.name.toLowerCase()
    for (const [key, days] of Object.entries(estimates)) {
      if (methodNameLower.includes(key)) {
        return days
      }
    }

    return undefined
  }
}

/**
 * Tax calculation utilities
 */
export class TaxCalculator {
  /**
   * Calculate tax for cart items based on destination
   */
  static calculateTax(
    cartItems: CartItem[],
    products: Product[],
    destination: ShippingAddress,
    taxRates: any[] = [] // TaxRate[] - keeping flexible for now
  ): number {
    // Basic tax calculation - could be enhanced with:
    // - Product-specific tax categories
    // - Complex tax rules
    // - Tax-exempt products
    // - Multiple tax jurisdictions

    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)
    
    // For now, apply a simple flat rate based on destination
    // In a real system, you'd look up tax rates by location
    const taxRate = this.getTaxRateForDestination(destination)
    
    return subtotal * (taxRate / 100)
  }

  private static getTaxRateForDestination(destination: ShippingAddress): number {
    // Simplified tax rate lookup
    // In reality, this would query tax rate tables based on location
    const defaultRates: Record<string, number> = {
      'US': 8.5,     // Average US sales tax
      'CA': 12,      // HST/GST + PST
      'GB': 20,      // VAT
      'DE': 19,      // VAT
      'FR': 20,      // VAT
      'AU': 10,      // GST
      'PK': 17,      // Pakistan Sales Tax (GST)
    }

    return defaultRates[destination.country] ?? 0
  }
}
