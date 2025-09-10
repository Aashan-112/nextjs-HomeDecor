export interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  sku: string
  images: string[]
  category_id: string
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  materials: string[]
  colors: string[]
  dimensions?: {
    width?: number   // inches or cm
    height?: number  // inches or cm
    depth?: number   // inches or cm
  }
  weight?: number    // pounds or kg
  // Tax Configuration
  tax_rate?: number        // Tax rate as percentage (e.g., 8.5 for 8.5%)
  is_taxable?: boolean     // Whether this product is taxable (default: true)
  tax_category?: string    // Tax category for complex tax rules
  // Shipping Configuration
  requires_shipping?: boolean     // Whether product requires shipping (default: true)
  shipping_method?: 'fixed' | 'weight_based' | 'carrier_calculated' | 'zone_based' | 'free'
  shipping_cost?: number          // Fixed shipping cost (for 'fixed' method)
  shipping_weight?: number        // Override weight for shipping calculations
  shipping_class?: string         // Shipping class for grouping products
  is_fragile?: boolean           // Requires special handling
  is_hazardous?: boolean         // Hazardous materials (affects shipping)
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Profile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: string // Added role field for admin functionality
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  type: "shipping" | "billing"
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null  // Allow null for guest orders
  order_number: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  currency: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_company?: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  billing_first_name: string
  billing_last_name: string
  billing_company?: string
  billing_address_line_1: string
  billing_address_line_2?: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_country: string
  customer_email?: string     // Email for guest orders
  customer_phone?: string     // Phone for guest orders
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

// Shipping Configuration Types
export interface ShippingZone {
  id: string
  name: string              // e.g., "Local", "Regional", "National"
  description?: string
  countries: string[]       // Country codes
  states?: string[]         // State codes (for specific countries)
  postal_codes?: string[]   // Specific postal code ranges
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShippingMethod {
  id: string
  name: string              // e.g., "Standard Shipping", "Express"
  description?: string
  type: 'fixed' | 'weight_based' | 'carrier_calculated' | 'zone_based' | 'free'
  base_cost: number         // Base shipping cost
  per_weight_cost?: number  // Additional cost per weight unit
  per_item_cost?: number    // Additional cost per item
  free_shipping_threshold?: number // Minimum order amount for free shipping
  max_weight?: number       // Maximum weight for this method
  zones: string[]           // Applicable shipping zones
  carriers?: string[]       // Carrier codes (fedex, ups, usps)
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaxRate {
  id: string
  name: string              // e.g., "US Sales Tax", "VAT"
  rate: number              // Tax rate as percentage
  type: 'percentage' | 'fixed'
  countries: string[]       // Applicable countries
  states?: string[]         // Applicable states
  product_categories?: string[] // Applicable to specific product categories
  is_compound: boolean      // Whether this tax compounds with others
  is_active: boolean
  created_at: string
  updated_at: string
}

// Shipping Calculation Response
export interface ShippingQuote {
  method_id: string
  method_name: string
  cost: number
  estimated_days?: number
  carrier?: string
  service_code?: string
}

// Cart with calculated totals
export interface CartSummary {
  items: CartItem[]
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  available_shipping_methods: ShippingQuote[]
  selected_shipping_method?: string
}
