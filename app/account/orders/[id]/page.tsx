"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, FileText, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Order, OrderItem } from "@/lib/types"

interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      if (!user || !params.id) return

      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(*)
          `)
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching order:", error)
          router.push("/account/orders")
        } else {
          setOrder(data)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/account/orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, params.id, router])

  const handleCancelOrder = async () => {
    if (!order) return
    
    const confirmMessage = `Are you sure you want to cancel order #${order.order_number}?\n\nThis action cannot be undone and a refund will be processed within 3-5 business days.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setCancelling(true)

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation from order details page'
        })
      })

      const result = await response.json()

      if (result.ok) {
        // Update the local state to reflect the cancellation
        setOrder(prevOrder => prevOrder ? { ...prevOrder, status: 'cancelled' } : null)
        
        alert(`Order #${order.order_number} has been cancelled successfully!\n\n${result.refundInfo?.willBeRefunded ? `Refund of $${result.refundInfo.amount.toFixed(2)} will be processed within ${result.refundInfo.timeframe} to your ${result.refundInfo.method}.` : ''}`)
      } else {
        alert(result.error || 'Failed to cancel order. Please try again or contact customer support.')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('An error occurred while cancelling the order. Please contact customer support.')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />
      case "processing":
        return <Package className="h-5 w-5 text-orange-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "shipped":
        return "secondary"
      case "processing":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/account/orders">Back to Orders</Link>
            </Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account/orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Order #{order.order_number}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                {order.status}
              </Badge>
              <p className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items ({order.order_items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-b-0">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src="/diverse-products-still-life.png" alt={item.product_name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-2">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{order.shipping_amount === 0 ? "Free" : `$${order.shipping_amount.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${order.tax_amount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shipping_first_name} {order.shipping_last_name}
                    </p>
                    {order.shipping_company && <p>{order.shipping_company}</p>}
                    <p>{order.shipping_address_line_1}</p>
                    {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
                    <p>
                      {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                    </p>
                    <p>{order.shipping_country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.billing_first_name} {order.billing_last_name}
                    </p>
                    {order.billing_company && <p>{order.billing_company}</p>}
                    <p>{order.billing_address_line_1}</p>
                    {order.billing_address_line_2 && <p>{order.billing_address_line_2}</p>}
                    <p>
                      {order.billing_city}, {order.billing_state} {order.billing_postal_code}
                    </p>
                    <p>{order.billing_country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                {order.status === "shipped" && (
                  <Button className="w-full bg-transparent" variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Package
                  </Button>
                )}
                {order.status === "delivered" && (
                  <Button className="w-full bg-transparent" variant="outline">
                    Leave Review
                  </Button>
                )}
                {order.status === "pending" && (
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    disabled={cancelling}
                    onClick={handleCancelOrder}
                  >
                    {cancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Cancelling Order...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Order
                      </>
                    )}
                  </Button>
                )}
                {order.status === "cancelled" && (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-red-700 font-medium mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Order Cancelled
                    </div>
                    <p className="text-sm text-red-600">
                      This order has been cancelled. Refund is being processed.
                    </p>
                  </div>
                )}
                <Button className="w-full bg-transparent" variant="outline">
                  Download Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
