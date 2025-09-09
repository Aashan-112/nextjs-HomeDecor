"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Search, Eye, Package, Truck } from "lucide-react"
import type { Order } from "@/lib/types"
import Link from "next/link"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/admin/orders')
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error fetching orders:", errorData.error)
          setOrders([])
          return
        }
        
        const data = await response.json()
        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }
    return true
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating order status:", errorData.error)
        return
      }

      const updatedOrder = await response.json()
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o)))
    } catch (error) {
      console.error("Error updating order status:", error)
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
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Orders" description="Manage customer orders" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Orders" description="Manage customer orders" />

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                      <CardDescription>
                        {order.shipping_first_name} {order.shipping_last_name} •{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address_line_1}
                        {order.shipping_address_line_2 && <br />}
                        {order.shipping_address_line_2}
                        <br />
                        {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                        <br />
                        {order.shipping_country}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping:</span>
                          <span>${order.shipping_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax:</span>
                          <span>${order.tax_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Actions</h4>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="justify-start bg-transparent" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-3 w-3 mr-2" />
                            View Details
                          </Link>
                        </Button>

                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start bg-transparent"
                            onClick={() => updateOrderStatus(order.id, "processing")}
                          >
                            <Package className="h-3 w-3 mr-2" />
                            Mark Processing
                          </Button>
                        )}

                        {order.status === "processing" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start bg-transparent"
                            onClick={() => updateOrderStatus(order.id, "shipped")}
                          >
                            <Truck className="h-3 w-3 mr-2" />
                            Mark Shipped
                          </Button>
                        )}

                        {order.status === "shipped" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start bg-transparent"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >
                            <Package className="h-3 w-3 mr-2" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
