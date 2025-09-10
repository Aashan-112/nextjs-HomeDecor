"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner, ButtonSpinner } from "@/components/ui/loading-spinner"
import { Lock, CreditCard } from "lucide-react"

// Load Stripe outside of component to avoid recreating Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  clientSecret: string
  amount: number
  currency: string
  customerEmail: string
  onSuccess: (paymentResult: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

function CheckoutForm({ 
  clientSecret, 
  amount, 
  currency, 
  customerEmail, 
  onSuccess, 
  onError 
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError("Card element not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail,
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
        onError(stripeError.message || "Payment failed")
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess({
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount
        })
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      onError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit/Debit Card Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Details</label>
            <div className="p-3 border border-input rounded-md bg-background">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
            <p>Amount to be charged: <span className="font-medium">Rs. {(amount).toLocaleString()}</span></p>
          </div>

          <Button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isLoading ? (
              <>
                <ButtonSpinner className="mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay Rs. {(amount).toLocaleString()}
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Powered by Stripe • Your payment is protected
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  const [isStripeLoaded, setIsStripeLoaded] = useState(false)

  useEffect(() => {
    stripePromise.then((stripe) => {
      if (stripe) {
        setIsStripeLoaded(true)
      }
    })
  }, [])

  if (!isStripeLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" text="Loading secure payment form..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
