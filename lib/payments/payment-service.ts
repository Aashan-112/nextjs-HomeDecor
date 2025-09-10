/**
 * Payment Service for Arts & Crafts Home Decor
 * Supports multiple payment providers including local Pakistani methods
 */

import { PakistanShippingCalculator } from '@/lib/pakistan-shipping-fixed'

// Payment Provider Types
export type PaymentProvider = 'stripe' | 'jazzcash' | 'easypaisa' | 'cod' | 'bank_transfer'

// Payment Method Interface
export interface PaymentMethod {
  id: string
  provider: PaymentProvider
  name: string
  description: string
  fee: number // PKR
  available: boolean
  processingTime: string
  icon: string
}

// Payment Request Interface
export interface PaymentRequest {
  amount: number // PKR
  currency: 'PKR'
  orderId: string
  orderNumber: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: {
    name: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
}

// Payment Response Interface
export interface PaymentResponse {
  success: boolean
  paymentId?: string
  transactionId?: string
  message: string
  redirectUrl?: string
  error?: string
  requiresAction?: boolean
  actionType?: 'redirect' | 'verification' | 'manual_confirmation'
  clientSecret?: string // For Stripe Payment Intent
}

/**
 * Main Payment Service Class
 */
export class PaymentService {
  
  /**
   * Get available payment methods for Pakistani customers
   */
  static getAvailablePaymentMethods(orderAmount: number): PaymentMethod[] {
    return [
      // Credit/Debit Cards via Stripe
      {
        id: 'stripe_card',
        provider: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Visa, MasterCard, American Express',
        fee: Math.max(30, orderAmount * 0.029), // 2.9% + PKR 30
        available: true,
        processingTime: 'Instant',
        icon: '💳'
      },
      
      // JazzCash Mobile Wallet
      {
        id: 'jazzcash',
        provider: 'jazzcash',
        name: 'JazzCash',
        description: 'Mobile wallet payment',
        fee: Math.max(20, orderAmount * 0.02), // 2% + PKR 20
        available: true,
        processingTime: 'Instant',
        icon: '📱'
      },
      
      // EasyPaisa Mobile Wallet
      {
        id: 'easypaisa',
        provider: 'easypaisa',
        name: 'EasyPaisa',
        description: 'Mobile wallet payment',
        fee: Math.max(20, orderAmount * 0.02), // 2% + PKR 20
        available: true,
        processingTime: 'Instant',
        icon: '💸'
      },
      
      // Cash on Delivery
      {
        id: 'cod',
        provider: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        fee: 50, // Fixed PKR 50 COD fee
        available: orderAmount <= 50000, // Max PKR 50,000 for COD
        processingTime: 'On delivery',
        icon: '💰'
      },
      
      // Bank Transfer
      {
        id: 'bank_transfer',
        provider: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank account transfer',
        fee: 25, // Fixed PKR 25 fee
        available: true,
        processingTime: '1-2 business days',
        icon: '🏦'
      }
    ]
  }

  /**
   * Process payment based on selected method
   */
  static async processPayment(
    paymentMethodId: string,
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    
    const paymentMethods = this.getAvailablePaymentMethods(paymentRequest.amount)
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId)
    
    if (!selectedMethod) {
      return {
        success: false,
        error: 'Invalid payment method selected',
        message: 'Please select a valid payment method'
      }
    }

    if (!selectedMethod.available) {
      return {
        success: false,
        error: 'Payment method is not available for this order',
        message: 'Selected payment method is not available for this order amount'
      }
    }

    // Calculate final amount including payment fee
    const totalAmount = paymentRequest.amount + selectedMethod.fee

    switch (selectedMethod.provider) {
      case 'stripe':
        return await this.processStripePayment(paymentRequest, totalAmount)
      
      case 'jazzcash':
        return await this.processJazzCashPayment(paymentRequest, totalAmount)
      
      case 'easypaisa':
        return await this.processEasyPaisaPayment(paymentRequest, totalAmount)
      
      case 'cod':
        return await this.processCODPayment(paymentRequest, totalAmount)
      
      case 'bank_transfer':
        return await this.processBankTransferPayment(paymentRequest, totalAmount)
      
      default:
        return {
          success: false,
          error: 'Payment provider not implemented',
          message: 'This payment method is not yet supported'
        }
    }
  }

  /**
   * Process Stripe Payment
   */
  private static async processStripePayment(
    request: PaymentRequest,
    totalAmount: number
  ): Promise<PaymentResponse> {
    try {
      // Create Stripe Payment Intent via our API
      console.log('Creating Stripe Payment Intent:', { 
        amount: totalAmount, 
        orderId: request.orderId 
      })
      
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: request.currency,
          orderId: request.orderId,
          orderNumber: request.orderNumber,
          customerEmail: request.customerEmail,
          customerPhone: request.customerPhone,
          shippingAddress: request.shippingAddress
        })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment intent')
      }
      
      return {
        success: true,
        paymentId: data.paymentIntentId,
        transactionId: data.paymentIntentId,
        message: `Payment of ${PakistanShippingCalculator.formatPakistanCurrency(totalAmount)} is ready for processing`,
        requiresAction: true,
        actionType: 'verification',
        // Store client secret for frontend payment processing
        clientSecret: data.clientSecret
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error)
      return {
        success: false,
<<<<<<< HEAD
        error: error.message || 'Credit card payment failed. Please try again.',
=======
        error: 'Credit card payment failed. Please try again.',
>>>>>>> 1a1b3af679ca5f65d7b3dad00eaec278de7b7316
        message: 'Payment processing failed. Please check your card details and try again.'
      }
    }
  }

  /**
   * Process JazzCash Payment
   */
  private static async processJazzCashPayment(
    request: PaymentRequest,
    totalAmount: number
  ): Promise<PaymentResponse> {
    try {
      // JazzCash Integration - This would use their Merchant API
      console.log('Processing JazzCash payment:', { 
        amount: totalAmount, 
        orderId: request.orderId,
        phone: request.customerPhone 
      })
      
      const transactionId = `JC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      // In production, this would call JazzCash Merchant API
      const jazzcashPayload = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID || 'MC12345', // Your Merchant ID
        pp_SubMerchantID: '',
        pp_Password: process.env.JAZZCASH_PASSWORD || 'password', // Your API Password
        pp_TxnRefNo: transactionId,
        pp_Amount: totalAmount * 100, // JazzCash expects amount in paisa
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: new Date().toISOString().replace(/[-T:.Z]/g, ''),
        pp_BillReference: request.orderNumber,
        pp_Description: `Payment for Order #${request.orderNumber}`,
        pp_TxnExpiryDateTime: new Date(Date.now() + 15 * 60 * 1000).toISOString().replace(/[-T:.Z]/g, ''), // 15 minutes
        pp_ReturnURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/jazzcash/callback`,
        pp_SecureHash: '', // This would be calculated with HMAC-SHA256
        pp_MobileNumber: request.customerPhone?.replace('+92', '0') || '',
        pp_CNIC: '', // Optional: Customer CNIC
        ppmpf_1: '1', // Product ID
        ppmpf_2: '2', // Category ID  
        ppmpf_3: '3', // Sub Category ID
        ppmpf_4: '4', // Brand ID
        ppmpf_5: '5'  // Reserved
      }
      
      // Generate checkout URL for JazzCash
      const checkoutUrl = `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`
      
      return {
        success: true,
        paymentId: transactionId,
        transactionId: transactionId,
        message: `JazzCash payment initiated for ${PakistanShippingCalculator.formatPakistanCurrency(totalAmount)}. You will be redirected to complete payment.`,
        redirectUrl: checkoutUrl,
        requiresAction: true,
        actionType: 'redirect'
      }
    } catch (error) {
      console.error('JazzCash payment error:', error)
      return {
        success: false,
        error: 'JazzCash payment failed. Please check your mobile wallet balance and try again.',
        message: 'JazzCash payment could not be processed. Please verify your account balance.'
      }
    }
  }

  /**
   * Process EasyPaisa Payment
   */
  private static async processEasyPaisaPayment(
    request: PaymentRequest,
    totalAmount: number
  ): Promise<PaymentResponse> {
    try {
      // EasyPaisa Integration - This would use their Merchant API
      console.log('Processing EasyPaisa payment:', { 
        amount: totalAmount, 
        orderId: request.orderId,
        phone: request.customerPhone 
      })
      
      const transactionId = `EP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      // In production, this would call EasyPaisa Merchant API
      const easypaisaPayload = {
        merchant_id: process.env.EASYPAISA_MERCHANT_ID || 'EP12345',
        password: process.env.EASYPAISA_PASSWORD || 'password',
        transaction_id: transactionId,
        amount: totalAmount.toString(),
        currency: 'PKR',
        order_id: request.orderNumber,
        description: `Payment for Order #${request.orderNumber}`,
        customer_mobile: request.customerPhone?.replace('+92', '0') || '',
        customer_email: request.customerEmail,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/easypaisa/callback`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?payment=cancelled`,
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/easypaisa/webhook`,
        expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        payment_method: 'MA', // Mobile Account
        version: '2.0'
      }
      
      // Generate secure hash for EasyPaisa
      // In production, you would calculate HMAC-SHA256 hash
      const secureHash = 'dummy_hash_for_development'
      
      // EasyPaisa checkout URL
      const checkoutUrl = `https://easypaisa.com.pk/easypay/Index.jsf?${new URLSearchParams({
        ...easypaisaPayload,
        secure_hash: secureHash
      }).toString()}`
      
      return {
        success: true,
        paymentId: transactionId,
        transactionId: transactionId,
        message: `EasyPaisa payment initiated for ${PakistanShippingCalculator.formatPakistanCurrency(totalAmount)}. You will be redirected to complete payment.`,
        redirectUrl: checkoutUrl,
        requiresAction: true,
        actionType: 'redirect'
      }
    } catch (error) {
      console.error('EasyPaisa payment error:', error)
      return {
        success: false,
        error: 'EasyPaisa payment failed. Please check your mobile wallet balance and try again.',
        message: 'EasyPaisa payment could not be processed. Please verify your account balance.'
      }
    }
  }

  /**
   * Process Cash on Delivery
   */
  private static async processCODPayment(
    request: PaymentRequest,
    totalAmount: number
  ): Promise<PaymentResponse> {
    // COD doesn't require actual payment processing
    const codReferenceId = `cod_${request.orderNumber}_${Date.now()}`
    
    return {
      success: true,
      paymentId: codReferenceId,
      transactionId: codReferenceId,
      message: `Cash on Delivery confirmed for ${PakistanShippingCalculator.formatPakistanCurrency(totalAmount)}. Please keep exact change ready.`,
      requiresAction: false
    }
  }

  /**
   * Process Bank Transfer Payment
   */
  private static async processBankTransferPayment(
    request: PaymentRequest,
    totalAmount: number
  ): Promise<PaymentResponse> {
    const transferReferenceId = `bt_${request.orderNumber}_${Date.now()}`
    
    return {
      success: true,
      paymentId: transferReferenceId,
      transactionId: transferReferenceId,
      message: `Bank transfer instructions sent. Please transfer ${PakistanShippingCalculator.formatPakistanCurrency(totalAmount)} to the provided account details.`,
      requiresAction: true,
      actionType: 'manual_confirmation'
    }
  }

  /**
   * Get payment method by ID
   */
  static getPaymentMethodById(methodId: string, orderAmount: number): PaymentMethod | null {
    const methods = this.getAvailablePaymentMethods(orderAmount)
    return methods.find(m => m.id === methodId) || null
  }

  /**
   * Calculate total amount including payment fee
   */
  static calculateTotalWithFee(orderAmount: number, paymentMethodId: string): number {
    const method = this.getPaymentMethodById(paymentMethodId, orderAmount)
    return method ? orderAmount + method.fee : orderAmount
  }

  /**
   * Validate payment request
   */
  static validatePaymentRequest(request: PaymentRequest): string[] {
    const errors: string[] = []
    
    if (!request.amount || request.amount <= 0) {
      errors.push('Invalid payment amount')
    }
    
    if (!request.orderId) {
      errors.push('Order ID is required')
    }
    
    if (!request.customerEmail || !request.customerEmail.includes('@')) {
      errors.push('Valid customer email is required')
    }
    
    if (!request.shippingAddress?.city) {
      errors.push('Shipping city is required')
    }
    
    if (!request.items || request.items.length === 0) {
      errors.push('Order must contain at least one item')
    }
    
    return errors
  }
}

/**
 * Bank Account Details for Manual Transfers
 */
export const BUSINESS_BANK_DETAILS = {
  businessName: 'Arts & Crafts Home Decor',
  bankName: 'HBL Bank Limited',
  accountTitle: 'Arts & Crafts Home Decor',
  accountNumber: 'XXXX-XXXX-XXXX-1234', // Replace with actual account
  iban: 'PK XX HABB XXXX XXXX XXXX XXXX', // Replace with actual IBAN
  branchCode: 'XXXX',
  swiftCode: 'HABBNPKA',
  instructions: [
    'Transfer the exact amount as shown in your order',
    'Use your order number as reference',
    'Send screenshot of transfer receipt to support@artsandcrafts.pk',
    'Order will be processed after payment confirmation'
  ]
}
