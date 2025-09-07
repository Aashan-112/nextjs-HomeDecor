"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CreditCard, Lock, MapPin, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PakistanCitySelector, DeliveryOptions } from "@/components/checkout/PakistanCitySelector"
import { PakistanCity, PAKISTAN_CITIES } from "@/lib/data/pakistan-locations"
import { PakistanShippingCalculator } from "@/lib/pakistan-shipping-fixed"
import { BUSINESS_CONFIG, calculateShippingFromMuzaffargarh, isSameDayDeliveryAvailable } from "@/lib/config/business-config"
import { PaymentService, PaymentMethod, PaymentRequest, BUSINESS_BANK_DETAILS } from "@/lib/payments/payment-service"

interface CheckoutForm {
  // Shipping Address
  shippingFirstName: string
  shippingLastName: string
  shippingCompany: string
  shippingAddressLine1: string
  shippingAddressLine2: string
  shippingCityId: string
  shippingCityName: string
  shippingProvince: string
  shippingPostalCode: string

  // Billing Address
  billingFirstName: string
  billingLastName: string
  billingCompany: string
  billingAddressLine1: string
  billingAddressLine2: string
  billingCityId: string
  billingCityName: string
  billingProvince: string
  billingPostalCode: string

  // Payment
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string

  // Options
  sameAsShipping: boolean
  saveAddress: boolean
  notes: string
  
  // Payment
  selectedPaymentMethod: string
  
  // Selected cities for calculations
  selectedShippingCity: PakistanCity | null
  selectedBillingCity: PakistanCity | null
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, removeItem, loading: cartLoading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isSingleItemCheckout, setIsSingleItemCheckout] = useState(false)
  const [singleCheckoutItem, setSingleCheckoutItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    shippingFirstName: "",
    shippingLastName: "",
    shippingCompany: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCityId: "",
    shippingCityName: "",
    shippingProvince: "",
    shippingPostalCode: "",
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCityId: "",
    billingCityName: "",
    billingProvince: "",
    billingPostalCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    sameAsShipping: true,
    saveAddress: false,
    notes: "",
    selectedPaymentMethod: "",
    selectedShippingCity: null,
    selectedBillingCity: null,
  })

  // Calculate amounts based on checkout type
  const currentItems = isSingleItemCheckout ? [singleCheckoutItem].filter(Boolean) : items
  const currentTotal = isSingleItemCheckout && singleCheckoutItem 
    ? singleCheckoutItem.product.price * singleCheckoutItem.quantity
    : totalAmount

  // Calculate shipping cost from Muzaffargarh to selected city
  const getShippingCost = () => {
    if (!form.selectedShippingCity) return 300 // Default rural rate
    
    // Use your Muzaffargarh-based shipping calculation
    const shippingInfo = calculateShippingFromMuzaffargarh(form.selectedShippingCity.id, currentTotal)
    return shippingInfo.rate
  }
  
  const shippingCost = getShippingCost()
  const taxAmount = currentTotal * 0.17 // Pakistan GST
  const finalTotal = currentTotal + shippingCost + taxAmount

  useEffect(() => {
    // Check for single item checkout
    const urlParams = new URLSearchParams(window.location.search)
    const singleItemId = urlParams.get('single')
    
    if (singleItemId) {
      const storedItem = localStorage.getItem('checkout_item')
      if (storedItem) {
        try {
          const item = JSON.parse(storedItem)
          setIsSingleItemCheckout(true)
          setSingleCheckoutItem(item)
        } catch (error) {
          console.error('Failed to parse stored item:', error)
        }
      }
    }

    if (!user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }

    if (!cartLoading && !isSingleItemCheckout && items.length === 0) {
      router.push("/cart")
      return
    }
  }, [user, items, cartLoading, router, isSingleItemCheckout])

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean | PakistanCity | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleShippingCitySelect = (city: PakistanCity) => {
    setForm(prev => ({
      ...prev,
      shippingCityId: city.id,
      shippingCityName: city.name,
      shippingProvince: city.province,
      shippingPostalCode: city.postal_code_prefix + '000',
      selectedShippingCity: city,
      // Update billing if same as shipping is checked
      ...(prev.sameAsShipping && {
        billingCityId: city.id,
        billingCityName: city.name,
        billingProvince: city.province,
        billingPostalCode: city.postal_code_prefix + '000',
        selectedBillingCity: city
      })
    }))
  }

  const handleBillingCitySelect = (city: PakistanCity) => {
    setForm(prev => ({
      ...prev,
      billingCityId: city.id,
      billingCityName: city.name,
      billingProvince: city.province,
      billingPostalCode: city.postal_code_prefix + '000',
      selectedBillingCity: city
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (!form.shippingCityId) {
      alert('Please select your city for shipping')
      return
    }

    if (!form.selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Get selected payment method and calculate fees
      const selectedPaymentMethod = PaymentService.getPaymentMethodById(form.selectedPaymentMethod, currentTotal)
      if (!selectedPaymentMethod) {
        throw new Error('Invalid payment method selected')
      }

      const paymentFee = selectedPaymentMethod.fee
      const finalTotalWithPaymentFee = finalTotal + paymentFee

      // Pre-validate basic payment data (without orderId)
      if (!user.email || !user.email.includes('@')) {
        throw new Error('Valid customer email is required')
      }
      
      if (!form.shippingCityName) {
        throw new Error('Shipping city is required')
      }
      
      if (!currentItems || currentItems.length === 0) {
        throw new Error('Order must contain at least one item')
      }

      // Create order data - try enhanced schema first, fallback to basic
      const orderData: any = {
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal: currentTotal,
        tax_amount: taxAmount,
        shipping_amount: shippingCost,
        payment_fee: paymentFee,
        total_amount: finalTotalWithPaymentFee,
        currency: "PKR",
        payment_method: selectedPaymentMethod.name,
        payment_provider: selectedPaymentMethod.provider,
        shipping_first_name: form.shippingFirstName,
        shipping_last_name: form.shippingLastName,
        shipping_company: form.shippingCompany,
        shipping_address_line_1: form.shippingAddressLine1,
        shipping_address_line_2: form.shippingAddressLine2,
        shipping_city: form.shippingCityName,
        shipping_state: form.shippingProvince,
        shipping_postal_code: form.shippingPostalCode,
        shipping_country: 'PK',
        billing_first_name: form.sameAsShipping ? form.shippingFirstName : form.billingFirstName,
        billing_last_name: form.sameAsShipping ? form.shippingLastName : form.billingLastName,
        billing_company: form.sameAsShipping ? form.shippingCompany : form.billingCompany,
        billing_address_line_1: form.sameAsShipping ? form.shippingAddressLine1 : form.billingAddressLine1,
        billing_address_line_2: form.sameAsShipping ? form.shippingAddressLine2 : form.billingAddressLine2,
        billing_city: form.sameAsShipping ? form.shippingCityName : form.billingCityName,
        billing_state: form.sameAsShipping ? form.shippingProvince : form.billingProvince,
        billing_postal_code: form.sameAsShipping ? form.shippingPostalCode : form.billingPostalCode,
        billing_country: 'PK',
        notes: form.notes,
      }
      
      // Fallback shipping address for older schema compatibility
      const shippingAddress = `${form.shippingFirstName} ${form.shippingLastName}\n${form.shippingAddressLine1}${form.shippingAddressLine2 ? '\n' + form.shippingAddressLine2 : ''}\n${form.shippingCityName}, ${form.shippingProvince} ${form.shippingPostalCode}\nPakistan`
      orderData.shipping_address = shippingAddress

      const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = currentItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id || item.product?.id,
        product_name: item.product?.name || item.product_name,
        product_sku: item.product?.sku || item.product_sku || '',
        quantity: item.quantity,
        unit_price: item.product?.price || item.unit_price,
        total_price: (item.product?.price || item.unit_price) * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Create payment request with order ID
      const paymentRequest: PaymentRequest = {
        amount: currentTotal,
        currency: 'PKR',
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: user.email || '',
        customerPhone: user.phone || '',
        shippingAddress: {
          name: `${form.shippingFirstName} ${form.shippingLastName}`,
          address: `${form.shippingAddressLine1} ${form.shippingAddressLine2}`.trim(),
          city: form.shippingCityName,
          province: form.shippingProvince,
          postalCode: form.shippingPostalCode
        },
        items: currentItems.map(item => ({
          name: item.product?.name || item.product_name || '',
          price: item.product?.price || item.unit_price || 0,
          quantity: item.quantity
        }))
      }

      // Validate complete payment request
      const validationErrors = PaymentService.validatePaymentRequest(paymentRequest)
      if (validationErrors.length > 0) {
        throw new Error(`Payment validation failed: ${validationErrors.join(', ')}`)
      }

      // Process payment
      console.log('Processing payment with method:', form.selectedPaymentMethod)
      const paymentResult = await PaymentService.processPayment(form.selectedPaymentMethod, paymentRequest)

      if (!paymentResult.success) {
        // Payment failed - update order status and show error
        const currentNotes = order.notes || ''
        const failureNotes = `${currentNotes}\n\n--- PAYMENT FAILED ---\nError: ${paymentResult.error}\nFailed at: ${new Date().toLocaleString('en-PK')}`
        
        await supabase
          .from("orders")
          .update({ 
            status: "payment_failed",
            notes: failureNotes,
            updated_at: new Date().toISOString()
          })
          .eq("id", order.id)

        throw new Error(paymentResult.error || 'Payment processing failed')
      }

      // Payment successful - update order with payment details
      const updateData: any = {
        status: paymentResult.requiresAction ? "payment_pending" : "confirmed",
        payment_id: paymentResult.paymentId,
        transaction_id: paymentResult.transactionId,
        payment_status: paymentResult.requiresAction ? "pending" : "completed",
        payment_confirmed_at: !paymentResult.requiresAction ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }
      
      // Add payment notes (works for both old and new schema)
      const currentNotes = order.notes || ''
      const paymentNotes = currentNotes + (currentNotes ? '\n\n' : '') + 
        `--- PAYMENT DETAILS ---\nTransaction ID: ${paymentResult.transactionId}\nPayment ID: ${paymentResult.paymentId}\nStatus: ${paymentResult.message}\nProcessed: ${new Date().toLocaleString('en-PK')}`
      updateData.notes = paymentNotes
      
      await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id)

      console.log('Payment processed successfully:', paymentResult)

      // Clear cart or remove single item
      if (isSingleItemCheckout && singleCheckoutItem) {
        // For single item checkout, just remove the item from cart
        try {
          await removeItem(singleCheckoutItem.id)
        } catch (error) {
          console.error('Failed to remove item from cart:', error)
        }
        localStorage.removeItem('checkout_item')
      } else {
        // For full cart checkout, clear entire cart
        await clearCart()
      }

      // Redirect to success page
      router.push(`/checkout/success?order=${order.order_number}`)
    } catch (error) {
      console.error("Error creating order:", error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Checkout</h1>
          </div>
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">Complete your order</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Ships from {BUSINESS_CONFIG.shipping_origin.city_name}, {BUSINESS_CONFIG.shipping_origin.province}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingFirstName">First Name *</Label>
                      <Input
                        id="shippingFirstName"
                        required
                        value={form.shippingFirstName}
                        onChange={(e) => handleInputChange("shippingFirstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingLastName">Last Name *</Label>
                      <Input
                        id="shippingLastName"
                        required
                        value={form.shippingLastName}
                        onChange={(e) => handleInputChange("shippingLastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCompany">Company (Optional)</Label>
                    <Input
                      id="shippingCompany"
                      value={form.shippingCompany}
                      onChange={(e) => handleInputChange("shippingCompany", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddressLine1">Address Line 1 *</Label>
                    <Input
                      id="shippingAddressLine1"
                      required
                      value={form.shippingAddressLine1}
                      onChange={(e) => handleInputChange("shippingAddressLine1", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="shippingAddressLine2"
                      value={form.shippingAddressLine2}
                      onChange={(e) => handleInputChange("shippingAddressLine2", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Select Your City in Pakistan *
                    </Label>
                    <Select 
                      value={form.shippingCityId} 
                      onValueChange={(cityId) => {
                        const city = PAKISTAN_CITIES.find(c => c.id === cityId)
                        if (city) {
                          handleShippingCitySelect(city)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your city in Pakistan..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {/* Major Cities First */}
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                          Major Cities
                        </div>
                        {PAKISTAN_CITIES.filter(city => city.is_major_city)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name} ({city.province} - {city.shipping_zone})
                          </SelectItem>
                        ))}
                        
                        {/* Other Cities */}
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                          Other Cities
                        </div>
                        {PAKISTAN_CITIES.filter(city => !city.is_major_city)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name} ({city.province} - {city.shipping_zone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.selectedShippingCity && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Selected City</Label>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            {form.shippingCityName}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Province</Label>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            {form.shippingProvince}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shippingPostalCode">Postal Code</Label>
                          <Input
                            id="shippingPostalCode"
                            value={form.shippingPostalCode}
                            onChange={(e) => handleInputChange("shippingPostalCode", e.target.value)}
                            placeholder="Enter full postal code"
                          />
                        </div>
                      </div>
                      
                      {/* Delivery Options */}
                      <div className="border-t pt-4 mt-4">
                        <DeliveryOptions
                          cityId={form.selectedShippingCity.id}
                          orderValue={currentTotal}
                          className=""
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>Where should we send the invoice?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsShipping"
                      checked={form.sameAsShipping}
                      onCheckedChange={(checked) => handleInputChange("sameAsShipping", checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                  </div>

                  {!form.sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingFirstName">First Name *</Label>
                          <Input
                            id="billingFirstName"
                            required
                            value={form.billingFirstName}
                            onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingLastName">Last Name *</Label>
                          <Input
                            id="billingLastName"
                            required
                            value={form.billingLastName}
                            onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billingCompany">Company (Optional)</Label>
                        <Input
                          id="billingCompany"
                          value={form.billingCompany}
                          onChange={(e) => handleInputChange("billingCompany", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingAddressLine1">Address Line 1 *</Label>
                        <Input
                          id="billingAddressLine1"
                          required
                          value={form.billingAddressLine1}
                          onChange={(e) => handleInputChange("billingAddressLine1", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingAddressLine2">Address Line 2 (Optional)</Label>
                        <Input
                          id="billingAddressLine2"
                          value={form.billingAddressLine2}
                          onChange={(e) => handleInputChange("billingAddressLine2", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Select Billing City in Pakistan *
                        </Label>
                        <Select 
                          value={form.billingCityId} 
                          onValueChange={(cityId) => {
                            const city = PAKISTAN_CITIES.find(c => c.id === cityId)
                            if (city) {
                              handleBillingCitySelect(city)
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select billing city in Pakistan..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {/* Major Cities First */}
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                              Major Cities
                            </div>
                            {PAKISTAN_CITIES.filter(city => city.is_major_city)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name} ({city.province} - {city.shipping_zone})
                              </SelectItem>
                            ))}
                            
                            {/* Other Cities */}
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                              Other Cities
                            </div>
                            {PAKISTAN_CITIES.filter(city => !city.is_major_city)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name} ({city.province} - {city.shipping_zone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {form.selectedBillingCity && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Selected City</Label>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {form.billingCityName}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Province</Label>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {form.billingProvince}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingPostalCode">Postal Code</Label>
                            <Input
                              id="billingPostalCode"
                              value={form.billingPostalCode}
                              onChange={(e) => handleInputChange("billingPostalCode", e.target.value)}
                              placeholder="Enter full postal code"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PaymentService.getAvailablePaymentMethods(currentTotal).map((method) => {
                    const totalWithFee = currentTotal + method.fee
                    return (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          form.selectedPaymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => method.available && handleInputChange('selectedPaymentMethod', method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{method.icon}</div>
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {method.fee === 0 ? 'Free' : `+${PakistanShippingCalculator.formatPakistanCurrency(method.fee)}`}
                            </div>
                            <div className="text-sm text-muted-foreground">{method.processingTime}</div>
                          </div>
                        </div>
                        
                        {form.selectedPaymentMethod === method.id && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-800 font-medium mb-1">
                              Total with {method.name}: {PakistanShippingCalculator.formatPakistanCurrency(totalWithFee)}
                            </div>
                            {method.provider === 'cod' && (
                              <div className="text-xs text-blue-600">
                                ⚠️ Maximum order value for COD: {PakistanShippingCalculator.formatPakistanCurrency(50000)}
                              </div>
                            )}
                            {method.provider === 'bank_transfer' && (
                              <div className="text-xs text-blue-600">
                                🏦 Bank details will be provided after order confirmation
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!method.available && (
                          <div className="mt-2 text-xs text-red-600">
                            Not available for orders over {PakistanShippingCalculator.formatPakistanCurrency(50000)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {!form.selectedPaymentMethod && (
                    <div className="text-sm text-red-600 mt-2">
                      Please select a payment method to continue
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground pt-2">
                    <Lock className="h-3 w-3 mr-1" />
                    All payments are secure and encrypted
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                  <CardDescription>Any special instructions for your order?</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm"
                    placeholder="Special delivery instructions, gift message, etc."
                    value={form.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isSingleItemCheckout ? 'Single Item Checkout' : 'Order Summary'}
                  </CardTitle>
                  <CardDescription>
                    {currentItems.length} item{currentItems.length !== 1 ? "s" : ""} in your order
                    {isSingleItemCheckout && (
                      <span className="block text-xs text-blue-600 mt-1">
                        ✨ Buying this item only
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {currentItems.map((item, index) => {
                      const product = item.product || item
                      const productName = product?.name || item.product_name
                      const productPrice = product?.price || item.unit_price
                      const productImages = product?.images || []
                      
                      return (
                        <div key={item.id || `item-${index}`} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={productImages[0] || "/placeholder.jpg?height=64&width=64&query=product"}
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2">{productName}</h4>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            {isSingleItemCheckout && (
                              <p className="text-xs text-blue-600 font-medium">Single item purchase</p>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {PakistanShippingCalculator.formatPakistanCurrency(productPrice * item.quantity)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  {/* Shipping Information */}
                  {form.shippingCityId && form.selectedShippingCity && (
                    <div className={`p-3 rounded-lg border ${
                      form.selectedShippingCity.id === 'pk-mzg' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${
                        form.selectedShippingCity.id === 'pk-mzg'
                          ? 'text-green-900'
                          : 'text-blue-900'
                      }`}>
                        <Truck className="h-4 w-4" />
                        {form.selectedShippingCity.id === 'pk-mzg' ? (
                          <>🏠 Local Delivery in {form.selectedShippingCity.name}</>
                        ) : (
                          <>Shipping from {BUSINESS_CONFIG.shipping_origin.city_name} to {form.selectedShippingCity.name}</>
                        )}
                      </div>
                      <div className={`text-xs ${
                        form.selectedShippingCity.id === 'pk-mzg'
                          ? 'text-green-700'
                          : 'text-blue-700'
                      }`}>
                        {form.selectedShippingCity.id === 'pk-mzg' ? (
                          <>🚚 Same city delivery • Next day delivery • Lower shipping cost!</>
                        ) : (
                          <>{form.selectedShippingCity.province} • {form.selectedShippingCity.shipping_zone} zone • {form.selectedShippingCity.estimated_delivery_days} day delivery</>
                        )}
                      </div>
                      {form.selectedShippingCity.id === 'pk-mzg' && (
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          ⚡ Same-day delivery available for orders before 12:00 PM
                        </div>
                      )}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{PakistanShippingCalculator.formatPakistanCurrency(currentTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shipping {form.shippingCityId && form.selectedShippingCity ? `(${form.selectedShippingCity.shipping_zone})` : ''}
                      </span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          PakistanShippingCalculator.formatPakistanCurrency(shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST 17%)</span>
                      <span>{PakistanShippingCalculator.formatPakistanCurrency(taxAmount)}</span>
                    </div>
                    {form.selectedPaymentMethod && (() => {
                      const paymentMethod = PaymentService.getPaymentMethodById(form.selectedPaymentMethod, currentTotal)
                      return paymentMethod && paymentMethod.fee > 0 ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Fee ({paymentMethod.name})</span>
                          <span>{PakistanShippingCalculator.formatPakistanCurrency(paymentMethod.fee)}</span>
                        </div>
                      ) : null
                    })()}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>
                        {form.selectedPaymentMethod ? (
                          PakistanShippingCalculator.formatPakistanCurrency(
                            finalTotal + (PaymentService.getPaymentMethodById(form.selectedPaymentMethod, currentTotal)?.fee || 0)
                          )
                        ) : (
                          PakistanShippingCalculator.formatPakistanCurrency(finalTotal)
                        )}
                      </span>
                    </div>
                    {form.selectedPaymentMethod && (() => {
                      const paymentMethod = PaymentService.getPaymentMethodById(form.selectedPaymentMethod, currentTotal)
                      return paymentMethod ? (
                        <div className="text-center text-xs text-muted-foreground">
                          Paying with {paymentMethod.name} • {paymentMethod.processingTime}
                        </div>
                      ) : null
                    })()}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loading || !form.shippingCityId || !form.selectedPaymentMethod}
                  >
                    {loading ? "Processing..." : (() => {
                      const finalAmount = form.selectedPaymentMethod 
                        ? finalTotal + (PaymentService.getPaymentMethodById(form.selectedPaymentMethod, currentTotal)?.fee || 0)
                        : finalTotal
                      return `Complete Order - ${PakistanShippingCalculator.formatPakistanCurrency(finalAmount)}`
                    })()}
                  </Button>
                  
                  {(!form.shippingCityId || !form.selectedPaymentMethod) && (
                    <div className="text-center text-xs text-red-500">
                      {!form.shippingCityId && 'Please select your city'}
                      {!form.shippingCityId && !form.selectedPaymentMethod && ' and '}
                      {!form.selectedPaymentMethod && 'select a payment method'}
                      {' to continue'}
                    </div>
                  )}

                  <div className="text-center text-xs text-muted-foreground">
                    By completing your order, you agree to our Terms of Service and Privacy Policy
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
