"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Home } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            {orderNumber && (
              <p className="text-sm text-muted-foreground">
                Order Number: <span className="font-medium text-foreground">#{orderNumber}</span>
              </p>
            )}
          </div>

          {/* Order Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Here's what you can expect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Package className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">We're preparing your items for shipment</p>
                  </div>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Current
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-muted-foreground">Shipping</h4>
                    <p className="text-sm text-muted-foreground">Your order will be shipped within 1-2 business days</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-muted-foreground">Delivery</h4>
                    <p className="text-sm text-muted-foreground">Estimated delivery in 3-5 business days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderNumber && (
                <Button size="lg" asChild>
                  <Link href={`/order/${orderNumber}`}>View Order Details</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with order details and tracking information.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
