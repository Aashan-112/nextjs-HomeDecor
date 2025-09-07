import crypto from 'crypto'

/**
 * Pakistani Payment Gateway Utilities
 * Helper functions for JazzCash, EasyPaisa, and other local payment methods
 */

// JazzCash Response Codes
export const JAZZCASH_RESPONSE_CODES = {
  '000': 'Transaction Successful',
  '001': 'Transaction Failed',
  '101': 'Invalid Merchant ID',
  '102': 'Invalid Password',
  '103': 'Invalid Amount',
  '104': 'Invalid Transaction Reference Number',
  '124': 'Transaction Pending',
  '201': 'Invalid Mobile Number',
  '202': 'Insufficient Balance',
  '203': 'Mobile Account Blocked',
  '999': 'System Error'
} as const

// EasyPaisa Response Codes
export const EASYPAISA_RESPONSE_CODES = {
  '0000': 'Success',
  '0001': 'Transaction Pending',
  '0002': 'Transaction Failed',
  '1001': 'Invalid Merchant',
  '1002': 'Invalid Amount',
  '1003': 'Invalid Mobile Number',
  '2001': 'Insufficient Balance',
  '2002': 'Account Blocked',
  '3001': 'Network Error',
  '9999': 'System Error'
} as const

/**
 * Generate secure hash for JazzCash
 */
export function generateJazzCashHash(data: Record<string, any>, secretKey: string): string {
  // JazzCash uses specific field order for hash calculation
  const hashFields = [
    'pp_Amount',
    'pp_BillReference', 
    'pp_Description',
    'pp_Language',
    'pp_MerchantID',
    'pp_Password',
    'pp_ReturnURL',
    'pp_SubMerchantID',
    'pp_TxnCurrency',
    'pp_TxnDateTime',
    'pp_TxnExpiryDateTime',
    'pp_TxnRefNo',
    'pp_TxnType',
    'pp_Version'
  ]
  
  const hashString = hashFields
    .map(field => data[field] || '')
    .join('&')
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(hashString)
    .digest('hex')
    .toUpperCase()
}

/**
 * Generate secure hash for EasyPaisa
 */
export function generateEasyPaisaHash(data: Record<string, any>, secretKey: string): string {
  const hashFields = [
    'merchant_id',
    'password',
    'transaction_id',
    'amount',
    'currency',
    'order_id',
    'return_url'
  ]
  
  const hashString = hashFields
    .map(field => data[field] || '')
    .join('')
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(hashString)
    .digest('hex')
    .toUpperCase()
}

/**
 * Validate Pakistani mobile number
 */
export function validatePakistaniMobile(mobile: string): boolean {
  // Pakistani mobile format: +92XXXXXXXXXX or 03XXXXXXXXX
  const withCountryCode = /^\+92[0-9]{10}$/
  const withoutCountryCode = /^03[0-9]{9}$/
  
  return withCountryCode.test(mobile) || withoutCountryCode.test(mobile)
}

/**
 * Format Pakistani mobile number for payment gateways
 */
export function formatMobileForGateway(mobile: string, gateway: 'jazzcash' | 'easypaisa'): string {
  let formatted = mobile.replace(/\s+/g, '')
  
  if (formatted.startsWith('+92')) {
    formatted = '0' + formatted.substring(3)
  }
  
  // JazzCash expects 11 digits starting with 0
  // EasyPaisa accepts both formats
  if (gateway === 'jazzcash' && !formatted.startsWith('0')) {
    formatted = '0' + formatted
  }
  
  return formatted
}

/**
 * Generate transaction reference for Pakistani gateways
 */
export function generateTransactionRef(prefix: string, orderNumber: string): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${timestamp}${random}${orderNumber.slice(-4)}`
}

/**
 * Calculate payment fee based on Pakistani gateway rates
 */
export function calculatePaymentFee(amount: number, method: string): number {
  switch (method) {
    case 'jazzcash':
      // JazzCash: 2% + PKR 20 minimum
      return Math.max(20, Math.round(amount * 0.02))
    
    case 'easypaisa':
      // EasyPaisa: 2% + PKR 20 minimum
      return Math.max(20, Math.round(amount * 0.02))
    
    case 'stripe':
      // Stripe: 2.9% + PKR 30
      return Math.round(amount * 0.029) + 30
    
    case 'cod':
      // Cash on Delivery: Flat PKR 100
      return 100
    
    case 'bank_transfer':
      // Bank Transfer: PKR 25
      return 25
    
    default:
      return 0
  }
}

/**
 * Validate payment amount for Pakistani methods
 */
export function validatePaymentAmount(amount: number, method: string): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' }
  }

  // Maximum limits for different payment methods
  const limits = {
    jazzcash: 500000, // PKR 5 Lakh
    easypaisa: 300000, // PKR 3 Lakh  
    cod: 50000, // PKR 50,000
    bank_transfer: 10000000, // PKR 1 Crore
    stripe: 1000000 // PKR 10 Lakh
  }

  const limit = limits[method as keyof typeof limits]
  if (limit && amount > limit) {
    return { 
      valid: false, 
      error: `Amount exceeds ${method} limit of PKR ${limit.toLocaleString()}` 
    }
  }

  // Minimum amounts
  const minimums = {
    jazzcash: 50,
    easypaisa: 50,
    cod: 100,
    bank_transfer: 100,
    stripe: 100
  }

  const minimum = minimums[method as keyof typeof minimums]
  if (minimum && amount < minimum) {
    return {
      valid: false,
      error: `Minimum amount for ${method} is PKR ${minimum}`
    }
  }

  return { valid: true }
}

/**
 * Get payment method display information
 */
export function getPaymentMethodInfo(method: string) {
  const methods = {
    jazzcash: {
      name: 'JazzCash',
      icon: '📱',
      description: 'Pay using your Jazz mobile account',
      processingTime: 'Instant',
      acceptedCards: [],
      supportedNetworks: ['Jazz', 'Warid']
    },
    easypaisa: {
      name: 'EasyPaisa', 
      icon: '💳',
      description: 'Pay using your Telenor mobile account',
      processingTime: 'Instant',
      acceptedCards: [],
      supportedNetworks: ['Telenor']
    },
    stripe: {
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, MasterCard, American Express',
      processingTime: 'Instant',
      acceptedCards: ['Visa', 'MasterCard', 'American Express'],
      supportedNetworks: []
    },
    cod: {
      name: 'Cash on Delivery',
      icon: '💰',
      description: 'Pay when you receive your order',
      processingTime: 'On delivery',
      acceptedCards: [],
      supportedNetworks: []
    },
    bank_transfer: {
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct transfer to our bank account',
      processingTime: '1-2 business days',
      acceptedCards: [],
      supportedNetworks: ['All Pakistani Banks']
    }
  }

  return methods[method as keyof typeof methods] || null
}

/**
 * Format currency for Pakistani display
 */
export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

/**
 * Generate payment instruction text for Pakistani methods
 */
export function getPaymentInstructions(method: string, amount: number, mobile?: string): string[] {
  switch (method) {
    case 'jazzcash':
      return [
        'You will be redirected to JazzCash payment page',
        `Pay PKR ${amount.toLocaleString()} using your Jazz mobile account`,
        'Enter your Jazz account PIN to complete payment',
        'You will receive SMS confirmation after successful payment'
      ]
    
    case 'easypaisa':
      return [
        'You will be redirected to EasyPaisa payment page',
        `Pay PKR ${amount.toLocaleString()} using your Telenor mobile account`,
        'Enter your EasyPaisa PIN to complete payment',
        'Payment confirmation will be sent via SMS'
      ]
    
    case 'cod':
      return [
        `Prepare exact amount: PKR ${amount.toLocaleString()}`,
        'Our delivery agent will collect payment upon delivery',
        'Please have the exact amount ready',
        'Payment receipt will be provided'
      ]
    
    case 'bank_transfer':
      return [
        'Transfer the exact amount to our bank account',
        'Use your order number as reference',
        'Send payment screenshot to our WhatsApp',
        'Order will be processed after payment verification'
      ]
    
    default:
      return ['Follow the payment instructions to complete your order']
  }
}

/**
 * Check if payment method is available for city
 */
export function isPaymentMethodAvailable(method: string, city: string, amount: number): boolean {
  // COD restrictions for certain areas
  if (method === 'cod') {
    const codRestrictedCities = ['remote-areas', 'northern-areas']
    if (codRestrictedCities.includes(city.toLowerCase())) {
      return false
    }
    if (amount > 50000) {
      return false
    }
  }

  // All other methods available everywhere in Pakistan
  return true
}

/**
 * Get expected delivery time based on payment method
 */
export function getExpectedDeliveryTime(paymentMethod: string, city: string): string {
  if (paymentMethod === 'cod') {
    return 'Same day or next day delivery'
  }
  
  if (paymentMethod === 'bank_transfer') {
    return 'Processing after payment verification (1-3 business days)'
  }
  
  // For confirmed payments (JazzCash, EasyPaisa, Stripe)
  const majorCities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad']
  if (majorCities.includes(city.toLowerCase())) {
    return 'Next business day delivery'
  }
  
  return '2-3 business days delivery'
}
