import { ShippingAddress, ShippingCalculator } from './shipping'
import { CartItem, Product, ShippingQuote, ShippingMethod, ShippingZone } from './types'
import { 
  PAKISTAN_CITIES, 
  PAKISTAN_SHIPPING_ZONES,
  getPakistanCityByPostalCode,
  getPakistanCityById,
  getPakistanShippingRate,
  PakistanCity 
} from './data/pakistan-locations'

/**
 * Extended shipping calculator specifically for Pakistan
 */
export class PakistanShippingCalculator extends ShippingCalculator {
  
  /**
   * Calculate shipping specifically for Pakistan addresses
   */
  async calculatePakistanShipping(
    cartItems: CartItem[],
    products: Product[],
    destination: ShippingAddress,
    cityId?: string
  ): Promise<ShippingQuote[]> {
    // Validate it's a Pakistan address
    if (destination.country !== 'PK') {
      throw new Error('This calculator is only for Pakistan addresses')
    }

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

    // Find the city either by ID or postal code
    let city: PakistanCity | undefined
    
    if (cityId) {
      city = getPakistanCityById(cityId)
    } else if (destination.postal_code) {
      city = getPakistanCityByPostalCode(destination.postal_code)
    }

    if (!city) {
      // Default to most expensive shipping for unknown locations
      return [{
        method_id: 'standard-pakistan',
        method_name: 'Standard Delivery',
        cost: 500, // PKR
        estimated_days: 7
      }]
    }

    // Calculate order subtotal in PKR
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)
    
    // Get shipping rates for the city
    const shippingInfo = getPakistanShippingRate(city.id, subtotal)
    
    // Create shipping quotes based on available options
    const quotes: ShippingQuote[] = []

    // Standard delivery (always available)
    quotes.push({
      method_id: `standard-${city.shipping_zone}`,
      method_name: `Standard Delivery to ${city.name}`,
      cost: shippingInfo.rate,
      estimated_days: shippingInfo.estimatedDays,
      carrier: 'Pakistan Post'
    })

    // Express delivery (only for metro and urban areas)
    if (city.shipping_zone === 'metro' || city.shipping_zone === 'urban') {
      const expressRate = shippingInfo.isFree ? 0 : shippingInfo.rate * 1.5
      quotes.push({
        method_id: `express-${city.shipping_zone}`,
        method_name: `Express Delivery to ${city.name}`,
        cost: expressRate,
        estimated_days: Math.max(1, shippingInfo.estimatedDays - 1),
        carrier: 'TCS Express'
      })
    }

    // Cash on Delivery (COD) option
    if (city.shipping_zone !== 'rural') {
      const codFee = 50 // PKR COD fee
      quotes.push({
        method_id: `cod-${city.shipping_zone}`,
        method_name: `Cash on Delivery - ${city.name}`,
        cost: shippingInfo.rate + codFee,
        estimated_days: shippingInfo.estimatedDays,
        carrier: 'Leopards Courier'
      })
    }

    return quotes.sort((a, b) => a.cost - b.cost)
  }

  /**
   * Get delivery options for a specific Pakistani city
   */
  static getDeliveryOptionsForCity(cityId: string): {
    city: PakistanCity | undefined
    options: Array<{
      name: string
      description: string
      estimatedDays: number
      available: boolean
    }>
  } {
    const city = getPakistanCityById(cityId)
    
    const options = [
      {
        name: 'Standard Delivery',
        description: 'Regular postal service delivery',
        estimatedDays: city?.estimated_delivery_days || 7,
        available: true
      },
      {
        name: 'Express Delivery',
        description: 'Faster courier service',
        estimatedDays: Math.max(1, (city?.estimated_delivery_days || 7) - 1),
        available: city?.shipping_zone !== 'rural'
      },
      {
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        estimatedDays: city?.estimated_delivery_days || 7,
        available: city?.shipping_zone !== 'rural'
      },
      {
        name: 'Same Day Delivery',
        description: 'Delivery within the same day',
        estimatedDays: 0,
        available: city?.shipping_zone === 'metro' && city.is_major_city
      }
    ]

    return { city, options }
  }

  /**
   * Calculate shipping cost with Pakistani currency formatting
   */
  static formatPakistanCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Get shipping zones data for Pakistan
   */
  static getPakistanShippingZones() {
    return PAKISTAN_SHIPPING_ZONES
  }

  /**
   * Get all Pakistani cities data
   */
  static getPakistanCities() {
    return PAKISTAN_CITIES
  }

  /**
   * Search cities by name (for autocomplete)
   */
  static searchPakistanCities(query: string): PakistanCity[] {
    const searchTerm = query.toLowerCase().trim()
    return PAKISTAN_CITIES
      .filter(city => 
        city.name.toLowerCase().includes(searchTerm) ||
        city.province.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize major cities and exact matches
        if (a.is_major_city && !b.is_major_city) return -1
        if (!a.is_major_city && b.is_major_city) return 1
        
        // Exact name match comes first
        const aExact = a.name.toLowerCase().startsWith(searchTerm)
        const bExact = b.name.toLowerCase().startsWith(searchTerm)
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        return a.name.localeCompare(b.name)
      })
      .slice(0, 10) // Limit results for performance
  }
}

/**
 * Helper function to create Pakistan shipping zones for the main shipping calculator
 */
export function createPakistanShippingZones(): ShippingZone[] {
  return [
    {
      id: 'pk-metro',
      name: 'Pakistan - Metro Cities',
      description: 'Major metropolitan areas (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad)',
      countries: ['PK'],
      states: ['Punjab', 'Sindh', 'Federal Capital Territory'],
      postal_codes: ['54', '75', '44', '46', '38'], // Major city prefixes
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-urban',
      name: 'Pakistan - Urban Areas',
      description: 'City centers and urban districts',
      countries: ['PK'],
      states: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'],
      postal_codes: [], // Will match by state if postal code not in metro
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-rural',
      name: 'Pakistan - Rural Areas',
      description: 'Remote and rural locations',
      countries: ['PK'],
      states: ['Gilgit-Baltistan', 'Azad Kashmir'],
      postal_codes: ['15', '10'], // Rural area prefixes
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

/**
 * Helper function to create Pakistan shipping methods
 */
export function createPakistanShippingMethods(): ShippingMethod[] {
  return [
    {
      id: 'pk-standard-metro',
      name: 'Standard Delivery - Metro',
      description: 'Regular delivery to major cities',
      type: 'zone_based',
      base_cost: 150,
      free_shipping_threshold: 2500,
      zones: ['pk-metro'],
      carriers: ['Pakistan Post', 'TCS'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-standard-urban',
      name: 'Standard Delivery - Urban',
      description: 'Regular delivery to urban areas',
      type: 'zone_based',
      base_cost: 200,
      free_shipping_threshold: 3000,
      zones: ['pk-urban'],
      carriers: ['Pakistan Post', 'Leopards'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-standard-rural',
      name: 'Standard Delivery - Rural',
      description: 'Regular delivery to rural areas',
      type: 'zone_based',
      base_cost: 300,
      free_shipping_threshold: 4000,
      zones: ['pk-rural'],
      carriers: ['Pakistan Post'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-express-metro',
      name: 'Express Delivery - Metro',
      description: 'Fast delivery to major cities',
      type: 'zone_based',
      base_cost: 250,
      zones: ['pk-metro'],
      carriers: ['TCS Express', 'Leopards Express'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pk-express-urban',
      name: 'Express Delivery - Urban',
      description: 'Fast delivery to urban areas',
      type: 'zone_based',
      base_cost: 350,
      zones: ['pk-urban'],
      carriers: ['TCS Express', 'Leopards Express'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}
