"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StripeCheckout from "@/components/payments/StripeCheckout"
import { ArrowLeft, CreditCard, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface PaymentIntentData {
  clientSecret: string
  orderId: string
  orderNumber: string
  amount: number
  currency: string
  customerEmail: string
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentIntentData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const orderNumber = searchParams.get('order')
  const paymentMethod = searchParams.get('method')

  useEffect(() => {
    // Load payment intent data from localStorage
    const storedData = localStorage.getItem('stripe_payment_intent')
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as PaymentIntentData
        
        // Validate that this matches the expected order
        if (data.orderNumber === orderNumber) {
          setPaymentData(data)
          setPaymentStatus('ready')
        } else {
          setError('Payment data mismatch. Please try again.')
          setPaymentStatus('error')
        }
      } catch (err) {
        setError('Invalid payment data. Please start checkout again.')
        setPaymentStatus('error')
      }
    } else {
      setError('No payment data found. Please start checkout again.')
      setPaymentStatus('error')
    }
  }, [orderNumber])

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful:', paymentResult)
    setPaymentStatus('success')
    
    // Clear stored payment data
    localStorage.removeItem('stripe_payment_intent')
    
    // Redirect to success page after a brief delay
    setTimeout(() => {
      router.push(`/checkout/success?order=${orderNumber}`)
    }, 2000)
  }

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment error:', errorMessage)
    setError(errorMessage)
    setPaymentStatus('error')
  }

  const handleCancel = () => {
    localStorage.removeItem('stripe_payment_intent')
    router.push('/checkout')
  }

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Loading payment details..." />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Payment Successful!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your payment has been processed successfully. You will be redirected shortly.
                </p>
                <LoadingSpinner size="sm" text="Redirecting..." />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (paymentStatus === 'error' || !paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Payment Error
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    {error || 'An unexpected error occurred during payment processing.'}
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/checkout">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Checkout
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/cart">Try Again</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">Order #{orderNumber}</p>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'stripe' && paymentData && (
            <StripeCheckout
              clientSecret={paymentData.clientSecret}
              amount={paymentData.amount}
              currency={paymentData.currency}
              customerEmail={paymentData.customerEmail}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancel}
            />
          )}

          {/* Cancel Button */}
          <div className="text-center">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel and Return to Checkout
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground">
            <p>🔒 Your payment is secured with SSL encryption</p>
            <p>We never store your card details</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Loading..." />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
