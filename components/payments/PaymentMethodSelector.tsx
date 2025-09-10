'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PaymentService } from '@/lib/payments/payment-service'
import { 
  formatPKR, 
  getPaymentMethodInfo, 
  getPaymentInstructions,
  validatePaymentAmount,
  isPaymentMethodAvailable 
} from '@/lib/payments/pakistan-payment-utils'

interface PaymentMethodSelectorProps {
  orderAmount: number
  city: string
  onPaymentMethodChange: (methodId: string) => void
  selectedMethod: string | null
  disabled?: boolean
}

interface PaymentMethodDisplay {
  id: string
  name: string
  icon: string
  description: string
  fee: number
  processingTime: string
  available: boolean
  instructions?: string[]
  badge?: string
  validationError?: string
}

export default function PaymentMethodSelector({
  orderAmount,
  city,
  onPaymentMethodChange,
  selectedMethod,
  disabled = false
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentMethods()
  }, [orderAmount, city])

  const loadPaymentMethods = async () => {
    setLoading(true)
    
    try {
      const availableMethods = PaymentService.getAvailablePaymentMethods(orderAmount)
      
      const methodsWithInfo = availableMethods.map(method => {
        const info = getPaymentMethodInfo(method.id)
        const amountValidation = validatePaymentAmount(orderAmount, method.id)
        const cityAvailable = isPaymentMethodAvailable(method.id, city, orderAmount)
        const instructions = getPaymentInstructions(method.id, orderAmount + method.fee)
        
        let badge = ''
        if (method.processingTime === 'Instant') {
          badge = 'instant'
        } else if (method.id === 'cod') {
          badge = 'popular'
        }

        return {
          id: method.id,
          name: method.name,
          icon: info?.icon || '💳',
          description: method.description,
          fee: method.fee,
          processingTime: method.processingTime,
          available: method.available && amountValidation.valid && cityAvailable,
          instructions,
          badge,
          validationError: amountValidation.error
        }
      })

      setPaymentMethods(methodsWithInfo)
    } catch (error) {
      console.error('Failed to load payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMethodSelect = (methodId: string) => {
    if (disabled) return
    
    const method = paymentMethods.find(m => m.id === methodId)
    if (method && method.available) {
      onPaymentMethodChange(methodId)
    }
  }

  const getMethodBadge = (badge: string) => {
    switch (badge) {
      case 'instant':
        return <Badge variant="secondary" className="ml-2 text-xs">Instant</Badge>
      case 'popular':
        return <Badge variant="default" className="ml-2 text-xs">Popular</Badge>
      default:
        return null
    }
  }

  const getMethodStatusColor = (method: PaymentMethodDisplay) => {
    if (!method.available) return 'text-muted-foreground'
    if (selectedMethod === method.id) return 'text-primary'
    return 'text-foreground'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💳 Payment Methods
          <Badge variant="outline" className="text-xs">
            Choose your preferred payment option
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod || ''}
          onValueChange={handleMethodSelect}
          disabled={disabled}
          className="space-y-3"
        >
          {paymentMethods.map(method => (
            <div key={method.id} className="space-y-3">
              <div 
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-all duration-200 ${
                  method.available 
                    ? 'hover:border-primary cursor-pointer' 
                    : 'bg-muted cursor-not-allowed opacity-60'
                } ${
                  selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => method.available && handleMethodSelect(method.id)}
              >
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id}
                  disabled={!method.available}
                />
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{method.icon}</div>
                  
                  <div className="flex-1">
                    <Label 
                      htmlFor={method.id}
                      className={`text-base font-medium cursor-pointer ${getMethodStatusColor(method)}`}
                    >
                      {method.name}
                      {method.badge && getMethodBadge(method.badge)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ {method.processingTime}</span>
                      {method.fee > 0 && (
                        <span>💰 Fee: {formatPKR(method.fee)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {method.fee > 0 ? (
                    <div className="text-sm">
                      <div className="font-medium">{formatPKR(method.fee)}</div>
                      <div className="text-xs text-muted-foreground">fee</div>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">Free</Badge>
                  )}
                </div>
              </div>

              {/* Show validation error */}
              {!method.available && method.validationError && (
                <Alert className="ml-7">
                  <AlertDescription className="text-sm">
                    {method.validationError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Show payment instructions for selected method */}
              {selectedMethod === method.id && method.instructions && (
                <div className="ml-7 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                    Payment Instructions:
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    {method.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>

        {/* Total with selected payment fee */}
        {selectedMethod && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-sm">{formatPKR(orderAmount)}</span>
            </div>
            {(() => {
              const method = paymentMethods.find(m => m.id === selectedMethod)
              return method && method.fee > 0 ? (
                <>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">Payment Fee:</span>
                    <span className="text-sm">{formatPKR(method.fee)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t font-medium">
                    <span>Total Amount:</span>
                    <span className="text-lg">{formatPKR(orderAmount + method.fee)}</span>
                  </div>
                </>
              ) : null
            })()}
          </div>
        )}

        {/* Mobile-specific notes for Pakistani gateways */}
        {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">⚠️</span>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Important:</p>
                <p>
                  Ensure your {selectedMethod === 'jazzcash' ? 'Jazz' : 'Telenor'} mobile account 
                  has sufficient balance and is active. You will receive payment confirmation via SMS.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'cod' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">ℹ️</span>
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Cash on Delivery:</p>
                <p>
                  Our delivery agent will call you before delivery. Please have the exact amount ready. 
                  Additional COD fee of {formatPKR(100)} applies.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
