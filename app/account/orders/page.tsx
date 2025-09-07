"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { Package, Truck, CheckCircle, ArrowLeft, Eye, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import type { Order, OrderItem } from "@/lib/types"

interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return

      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching orders:", error)
        } else {
          setOrders(data || [])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`)) {
      return
    }

    setCancellingOrderId(orderId)

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation'
        })
      })

      const result = await response.json()

      if (result.ok) {
        // Update the local state to reflect the cancellation
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        )
        
        alert(`Order #${orderNumber} has been cancelled successfully. ${result.refundInfo?.willBeRefunded ? 'Refund will be processed within ' + result.refundInfo.timeframe : ''}`)
      } else {
        alert(result.error || 'Failed to cancel order. Please try again.')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('An error occurred while cancelling the order. Please try again.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
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
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
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
                <Link href="/account">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Orders</h1>
            </div>
            <p className="text-lg text-muted-foreground">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-8">Start shopping to see your orders here</p>
              <Button size="lg" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          Order #{order.order_number}
                        </CardTitle>
                        <CardDescription>
                          Placed on {new Date(order.created_at).toLocaleDateString()} • {order.order_items.length} item
                          {order.order_items.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • ${item.unit_price.toFixed(2)} each
                            </p>
                          </div>
                          <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Shipping to: {order.shipping_city}, {order.shipping_state}
                        </p>
                        {order.status === "shipped" && (
                          <p className="text-sm text-accent font-medium">Tracking: TRK123456789</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="bg-transparent" asChild>
                        <Link href={`/account/orders/${order.id}`}>
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Leave Review
                        </Button>
                      )}
                      {(order.status === "shipped" || order.status === "delivered") && (
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Track Package
                        </Button>
                      )}
                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                          disabled={cancellingOrderId === order.id}
                          onClick={() => handleCancelOrder(order.id, order.order_number)}
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-2" />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
