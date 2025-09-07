import { PaymentService } from '@/lib/payments/payment-service'
import type { PaymentRequest, PaymentResult } from '@/lib/payments/payment-service'

describe('PaymentService', () => {
  describe('getPaymentMethods', () => {
    it('should return all payment methods with correct structure', () => {
      const methods = PaymentService.getPaymentMethods(1000)
      
      expect(methods).toHaveLength(5)
      expect(methods.map(m => m.id)).toEqual(['stripe', 'jazzcash', 'easypaisa', 'cod', 'bank-transfer'])
      
      // Check each method has required fields
      methods.forEach(method => {
        expect(method).toHaveProperty('id')
        expect(method).toHaveProperty('name')
        expect(method).toHaveProperty('description')
        expect(method).toHaveProperty('fee')
        expect(method).toHaveProperty('enabled')
        expect(method).toHaveProperty('processingTime')
      })
    })

    it('should calculate correct fees for different amounts', () => {
      const methods1000 = PaymentService.getPaymentMethods(1000)
      const methods10000 = PaymentService.getPaymentMethods(10000)
      
      // Stripe: 2.9% + PKR 30
      expect(methods1000.find(m => m.id === 'stripe')?.fee).toBe(59) // (1000 * 0.029) + 30
      expect(methods10000.find(m => m.id === 'stripe')?.fee).toBe(320) // (10000 * 0.029) + 30
      
      // JazzCash: 1.5%
      expect(methods1000.find(m => m.id === 'jazzcash')?.fee).toBe(15)
      expect(methods10000.find(m => m.id === 'jazzcash')?.fee).toBe(150)
      
      // COD: Flat PKR 100
      expect(methods1000.find(m => m.id === 'cod')?.fee).toBe(100)
      expect(methods10000.find(m => m.id === 'cod')?.fee).toBe(100)
    })
  })

  describe('getPaymentMethodById', () => {
    it('should return correct payment method by id', () => {
      const jazzcash = PaymentService.getPaymentMethodById('jazzcash', 1000)
      
      expect(jazzcash).toEqual({
        id: 'jazzcash',
        name: 'JazzCash',
        description: 'Pay using JazzCash mobile wallet',
        fee: 15,
        enabled: true,
        processingTime: 'Instant'
      })
    })

    it('should return undefined for non-existent payment method', () => {
      const result = PaymentService.getPaymentMethodById('invalid-id', 1000)
      expect(result).toBeUndefined()
    })
  })

  describe('validatePaymentRequest', () => {
    const validRequest: PaymentRequest = {
      orderId: 'order-123',
      amount: 1000,
      paymentMethodId: 'stripe',
      currency: 'PKR',
      customerEmail: 'test@example.com',
      customerPhone: '+923001234567'
    }

    it('should validate correct payment request', () => {
      const result = PaymentService.validatePaymentRequest(validRequest)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid email format', () => {
      const invalidRequest = { ...validRequest, customerEmail: 'invalid-email' }
      const result = PaymentService.validatePaymentRequest(invalidRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid email format')
    })

    it('should reject invalid phone format', () => {
      const invalidRequest = { ...validRequest, customerPhone: '123' }
      const result = PaymentService.validatePaymentRequest(invalidRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid Pakistani phone number format')
    })

    it('should reject invalid amount', () => {
      const invalidRequest = { ...validRequest, amount: 0 }
      const result = PaymentService.validatePaymentRequest(invalidRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Amount must be greater than 0')
    })

    it('should reject invalid payment method', () => {
      const invalidRequest = { ...validRequest, paymentMethodId: 'invalid-method' }
      const result = PaymentService.validatePaymentRequest(invalidRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid payment method')
    })

    it('should reject unsupported currency', () => {
      const invalidRequest = { ...validRequest, currency: 'USD' as any }
      const result = PaymentService.validatePaymentRequest(invalidRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Only PKR currency is supported')
    })

  describe('processPayment', () => {
    const validRequest: PaymentRequest = {
      orderId: 'order-123',
      amount: 1000,
      paymentMethodId: 'cod',
      currency: 'PKR',
      customerEmail: 'test@example.com',
      customerPhone: '+923001234567'
    }

    it('should process COD payment successfully', async () => {
      const result = await PaymentService.processPayment(validRequest)
      
      expect(result.success).toBe(true)
      expect(result.status).toBe('confirmed')
      expect(result.paymentMethodId).toBe('cod')
      expect(result.message).toContain('Cash on Delivery order confirmed')
    })

    it('should process bank transfer payment', async () => {
      const bankTransferRequest = { ...validRequest, paymentMethodId: 'bank-transfer' }
      const result = await PaymentService.processPayment(bankTransferRequest)
      
      expect(result.success).toBe(true)
      expect(result.status).toBe('pending_verification')
      expect(result.message).toContain('pending bank transfer verification')
      expect(result.bankDetails).toBeDefined()
    })

    it('should handle Stripe payment processing', async () => {
      const stripeRequest = { ...validRequest, paymentMethodId: 'stripe' }
      const result = await PaymentService.processPayment(stripeRequest)
      
      // Should return pending status as it's a mock implementation
      expect(result.success).toBe(true)
      expect(result.status).toBe('pending')
      expect(result.message).toContain('Payment initiated via Stripe')
    })

    it('should handle JazzCash payment processing', async () => {
      const jazzcashRequest = { ...validRequest, paymentMethodId: 'jazzcash' }
      const result = await PaymentService.processPayment(jazzcashRequest)
      
      expect(result.success).toBe(true)
      expect(result.status).toBe('pending')
      expect(result.message).toContain('Payment initiated via JazzCash')
    })

    it('should handle invalid payment request', async () => {
      const invalidRequest = { ...validRequest, amount: 0 }
      const result = await PaymentService.processPayment(invalidRequest)
      
      expect(result.success).toBe(false)
      expect(result.status).toBe('failed')
      expect(result.errors).toContain('Amount must be greater than 0')
    })
  })

  describe('Pakistani phone number validation', () => {
    it('should accept valid Pakistani phone numbers', () => {
      const validNumbers = [
        '+923001234567',
        '+923331234567',
        '+923451234567'
      ]
      
      validNumbers.forEach(phone => {
        const request: PaymentRequest = {
          orderId: 'test',
          amount: 1000,
          paymentMethodId: 'cod',
          currency: 'PKR',
          customerEmail: 'test@example.com',
          customerPhone: phone
        }
        
        const result = PaymentService.validatePaymentRequest(request)
        expect(result.isValid).toBe(true)
      })
    })

    it('should reject invalid Pakistani phone numbers', () => {
      const invalidNumbers = [
        '03001234567', // missing country code
        '+923001234', // too short
        '+9230012345678', // too long
        '+1234567890', // wrong country code
        'not-a-number'
      ]
      
      invalidNumbers.forEach(phone => {
        const request: PaymentRequest = {
          orderId: 'test',
          amount: 1000,
          paymentMethodId: 'cod',
          currency: 'PKR',
          customerEmail: 'test@example.com',
          customerPhone: phone
        }
        
        const result = PaymentService.validatePaymentRequest(request)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid Pakistani phone number format')
      })
    })
  })
})
