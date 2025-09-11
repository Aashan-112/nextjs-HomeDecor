// Business Configuration
// This file contains your business details and shipping configuration

export const BUSINESS_CONFIG = {
  // Business Information
  business_name: "99 Arts and Crafts",
  business_type: "Handcrafted Home Accessories & Mirrors",
  
  // Shipping Origin (Your Location)
  shipping_origin: {
    city_id: "pk-mzg",
    city_name: "Muzaffargarh",
    province: "Punjab",
    postal_code: "34000",
    country: "Pakistan",
    shipping_zone: "urban",
    coordinates: {
      lat: 30.0644,
      lng: 71.1932
    }
  },
  
  // Business Address Details
  business_address: {
    full_address: "Muzaffargarh, Punjab, Pakistan",
    city: "Muzaffargarh",
    province: "Punjab",
    postal_code: "34000",
    country: "PK"
  },
  
  // Shipping Configuration from Muzaffargarh
  shipping_from_origin: {
    // Same city delivery (within Muzaffargarh)
    local_delivery: {
      rate: 100, // PKR - Lower rate for same city
      estimated_days: 1,
      description: "Same city delivery within Muzaffargarh"
    },
    
    // Regional delivery (Punjab cities)
    regional_delivery: {
      rate: 150, // PKR
      estimated_days: 1,
      description: "Delivery within Punjab province"
    },
    
    // National delivery (other provinces)
    national_delivery: {
      metro: {
        rate: 200, // PKR - to major cities like Karachi, Lahore
        estimated_days: 2,
        description: "Express delivery to major cities"
      },
      urban: {
        rate: 250, // PKR - to urban areas
        estimated_days: 2,
        description: "Standard delivery to urban areas"
      },
      rural: {
        rate: 300, // PKR - to rural areas
        estimated_days: 3,
        description: "Delivery to rural locations"
      }
    }
  },
  
  // Free Shipping Thresholds from Muzaffargarh
  free_shipping: {
    local: 1500,     // PKR - Same city (Muzaffargarh)
    regional: 2000,  // PKR - Punjab province
    metro: 2500,     // PKR - Major cities nationwide
    urban: 3000,     // PKR - Urban areas
    rural: 4000      // PKR - Rural areas
  },
  
  // Business Hours & Shipping Schedule
  shipping_schedule: {
    processing_days: 1, // Days to process order before shipping
    cutoff_time: "15:00", // Orders after this time ship next day
    working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shipping_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  
  // Special Services
  services: {
    same_day_delivery: {
      available_in: ["pk-mzg"], // Only in Muzaffargarh
      cutoff_time: "12:00",
      additional_cost: 200, // PKR
      description: "Same day delivery within Muzaffargarh"
    },
    cash_on_delivery: {
      available: true,
      fee: 50, // PKR
      max_amount: 50000, // PKR
      description: "Pay when you receive your order"
    },
    express_packaging: {
      available: true,
      fee: 100, // PKR
      description: "Premium packaging for fragile items"
    }
  }
}

/**
 * Calculate shipping cost from Muzaffargarh to destination city
 */
export function calculateShippingFromMuzaffargarh(
  destinationCityId: string,
  orderValue: number
): {
  rate: number
  is_free: boolean
  estimated_days: number
  description: string
  service_type: string
} {
  const config = BUSINESS_CONFIG.shipping_from_origin
  const freeThresholds = BUSINESS_CONFIG.free_shipping
  
  // Same city delivery (Muzaffargarh)
  if (destinationCityId === "pk-mzg") {
    const isFree = orderValue >= freeThresholds.local
    return {
      rate: isFree ? 0 : config.local_delivery.rate,
      is_free: isFree,
      estimated_days: config.local_delivery.estimated_days,
      description: config.local_delivery.description,
      service_type: "local"
    }
  }
  
  // Look up destination city to determine shipping zone
  // This would typically integrate with your city data
  // For now, we'll use a simple fallback to urban delivery
  const isFree = orderValue >= freeThresholds.urban
  return {
    rate: isFree ? 0 : config.national_delivery.urban.rate,
    is_free: isFree,
    estimated_days: config.national_delivery.urban.estimated_days,
    description: config.national_delivery.urban.description,
    service_type: "national"
  }
}

/**
 * Get business location details
 */
export function getBusinessLocation() {
  return BUSINESS_CONFIG.shipping_origin
}

/**
 * Check if same-day delivery is available for a city
 */
export function isSameDayDeliveryAvailable(cityId: string): boolean {
  return BUSINESS_CONFIG.services.same_day_delivery.available_in.includes(cityId)
}

/**
 * Get estimated delivery date from Muzaffargarh
 */
export function getEstimatedDeliveryDate(
  destinationCityId: string,
  orderDate: Date = new Date()
): Date {
  const shippingInfo = calculateShippingFromMuzaffargarh(destinationCityId, 0)
  const processingDays = BUSINESS_CONFIG.shipping_schedule.processing_days
  const totalDays = processingDays + shippingInfo.estimated_days
  
  const deliveryDate = new Date(orderDate)
  deliveryDate.setDate(deliveryDate.getDate() + totalDays)
  
  return deliveryDate
}
