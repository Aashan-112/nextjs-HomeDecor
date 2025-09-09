"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Package, User, CreditCard, MapPin, Truck, CheckCircle, FileText, Mail, Printer, ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Order, OrderItem } from "@/lib/types"
import { toast } from "sonner"

interface OrderItemWithProduct extends OrderItem {
  products?: {
    name: string
    images: string[]
  }
}

interface OrderWithItems extends Order {
  order_items: OrderItemWithProduct[]
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [printingLabel, setPrintingLabel] = useState(false)

  useEffect(() => {
    console.log('🚀 [ORDER DETAIL] useEffect triggered with params:', params)
    
    async function fetchOrder() {
      try {
        console.log('🚨 [ORDER DETAIL] Function started')
        
        if (!params.id) {
          console.log('❌ [ORDER DETAIL] No order ID provided')
          setLoading(false)
          return
        }

        console.log(`🔍 [ORDER DETAIL] Fetching order: ${params.id}`)
        const supabase = createClient()
        console.log('🔧 [ORDER DETAIL] Supabase client created')

        try {
          console.log('📝 [ORDER DETAIL] Starting authentication flow...')
          console.log('🔍 [ORDER DETAIL] Calling supabase.auth.getUser()...')
          
          // Add timeout wrapper for auth call
          const authTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
          )
          
          const authPromise = supabase.auth.getUser()
          
          console.log('🔍 [ORDER DETAIL] Racing auth call against timeout...')
          
          let authResult: any
          try {
            authResult = await Promise.race([authPromise, authTimeout])
          } catch (timeoutError) {
            console.error('⏰ [ORDER DETAIL] Auth call timed out:', timeoutError)
            console.log('🚨 [ORDER DETAIL] Skipping auth check due to timeout - trying direct order fetch')
            
            try {
              console.log('🔍 [ORDER DETAIL] Attempting direct order fetch for ID:', params.id)
              
              // Add timeout for direct query too
              const directQueryTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Direct query timeout after 5 seconds')), 5000)
              )
              
              const directQueryPromise = supabase
                .from("orders")
                .select(`
                  *,
                  order_items(
                    *,
                    products(name, images)
                  )
                `)
                .eq("id", params.id)
                .single()
                
              console.log('🔍 [ORDER DETAIL] Racing direct query against timeout...')
              
              let queryResult: any
              try {
                queryResult = await Promise.race([directQueryPromise, directQueryTimeout])
              } catch (queryTimeoutError) {
                console.error('⏰ [ORDER DETAIL] Direct query timed out:', queryTimeoutError)
                console.log('🔄 [ORDER DETAIL] Direct query timed out, trying API immediately...')
                
                // Go straight to API fallback
                const apiResponse = await fetch(`/api/admin/orders/${params.id}`, {
                  method: 'GET',
                  credentials: 'include'
                })
                
                if (apiResponse.ok) {
                  const orderData = await apiResponse.json()
                  console.log('✅ [ORDER DETAIL] API fallback successful after query timeout:', orderData.order?.order_number)
                  setOrder(orderData.order)
                  setNotes(orderData.order?.notes || "")
                  setLoading(false)
                  return
                } else {
                  console.error('❌ [ORDER DETAIL] API fallback failed after query timeout:', apiResponse.status)
                  setLoading(false)
                  return
                }
              }
              
              const { data, error } = queryResult as any
              
              console.log('📊 [ORDER DETAIL] Direct fetch completed:')
              console.log('  - Has data:', !!data)
              console.log('  - Error:', error)
              console.log('  - Order number:', data?.order_number)
              
              if (!error && data) {
                console.log('✅ [ORDER DETAIL] Direct fetch successful - setting order data')
                setOrder(data)
                setNotes(data.notes || "")
                setLoading(false)
                console.log('✅ [ORDER DETAIL] Order state updated, loading set to false')
                return
              } else {
                console.error('❌ [ORDER DETAIL] Direct fetch failed:')
                console.error('  - Error code:', error?.code)
                console.error('  - Error message:', error?.message)
                console.error('  - Full error:', JSON.stringify(error, null, 2))
                
                // Try API fallback
                console.log('🔄 [ORDER DETAIL] Trying API fallback...')
                
                try {
                  const apiResponse = await fetch(`/api/admin/orders/${params.id}`, {
                    method: 'GET',
                    credentials: 'include'
                  })
                  
                  console.log('📊 [ORDER DETAIL] API response status:', apiResponse.status)
                  
                  if (apiResponse.ok) {
                    const orderData = await apiResponse.json()
                    console.log('✅ [ORDER DETAIL] API fallback successful:', orderData.order?.order_number)
                    setOrder(orderData.order)
                    setNotes(orderData.order?.notes || "")
                    setLoading(false)
                    console.log('✅ [ORDER DETAIL] API fallback - order state updated')
                    return
                  } else {
                    const errorText = await apiResponse.text()
                    console.error('❌ [ORDER DETAIL] API fallback failed:', apiResponse.status, errorText)
                  }
                } catch (apiFetchError) {
                  console.error('🚨 [ORDER DETAIL] API fetch error:', apiFetchError)
                }
                
                setLoading(false)
                console.log('❌ [ORDER DETAIL] All fallbacks failed - loading set to false')
                return
              }
            } catch (directFetchError) {
              console.error('🚨 [ORDER DETAIL] Exception in direct fetch:', directFetchError)
              console.error('  - Error stack:', directFetchError instanceof Error ? directFetchError.stack : 'No stack')
              setLoading(false)
              return
            }
          }
        
          const { data: { user }, error: authError } = authResult as any
          
          console.log('🔐 [ORDER DETAIL] Auth check result:')
          console.log('  - User exists:', !!user)
          console.log('  - User ID:', user?.id)
          console.log('  - Auth error:', authError)
          
          if (authError) {
            console.error('❌ [ORDER DETAIL] Auth error details:', JSON.stringify(authError, null, 2))
          }
        
        if (!user) {
          console.error('❌ [ORDER DETAIL] User not authenticated')
          setLoading(false)
          router.push('/auth/login')
          return
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        console.log('👤 [ORDER DETAIL] Profile check:', { profile, error: profileError })

        if (profile?.role !== 'admin') {
          console.error('❌ [ORDER DETAIL] User is not admin')
          setLoading(false)
          router.push('/')
          return
        }

        console.log('✅ [ORDER DETAIL] User authenticated as admin, fetching order data...')

        console.log('🔍 [ORDER DETAIL] Executing order query for ID:', params.id)
        
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(
              *,
              products(name, images)
            )
          `)
          .eq("id", params.id)
          .single()

        console.log('📊 [ORDER DETAIL] Query completed:', { 
          hasData: !!data, 
          error: error,
          orderId: data?.id,
          orderNumber: data?.order_number 
        })

        if (error) {
          console.error("❌ [ORDER DETAIL] Error fetching order:", error)
          if (error.code === 'PGRST116') {
            console.log('📋 [ORDER DETAIL] Order not found, redirecting...')
          } else {
            console.error('❌ [ORDER DETAIL] Database error:', error.message)
            console.error('❌ [ORDER DETAIL] Full error object:', JSON.stringify(error, null, 2))
          }
          // Don't redirect immediately, let user see what happened
          setLoading(false)
        } else {
          console.log('✅ [ORDER DETAIL] Order fetched successfully:', {
            id: data.id,
            orderNumber: data.order_number,
            itemCount: data.order_items?.length || 0
          })
          setOrder(data)
          setNotes(data.notes || "")
          setLoading(false)
        }
        } catch (error) {
          console.error("❌ [ORDER DETAIL] Auth/Query error:", error)
          console.error("❌ [ORDER DETAIL] Error stack:", error instanceof Error ? error.stack : 'No stack trace')
          setLoading(false)
        } finally {
          console.log('📝 [ORDER DETAIL] Auth try-catch finally block')
        }
      } catch (outerError) {
        console.error("❌ [ORDER DETAIL] Outer function error:", outerError)
        console.error("❌ [ORDER DETAIL] Outer error stack:", outerError instanceof Error ? outerError.stack : 'No stack trace')
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, router])

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id)

      if (error) throw error

      setOrder({ ...order, status: newStatus as any })
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  const updateOrderNotes = async () => {
    if (!order) return

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ notes }).eq("id", order.id)

      if (error) throw error

      setOrder({ ...order, notes })
      toast.success("Order notes updated")
    } catch (error) {
      console.error("Error updating order notes:", error)
      toast.error("Failed to update order notes")
    } finally {
      setUpdating(false)
    }
  }

  const sendStatusEmail = async () => {
    if (!order) return

    setSendingEmail(true)
    try {
      // Create email content based on order status
      const customerName = `${order.shipping_first_name} ${order.shipping_last_name}`
      const orderNumber = order.order_number
      const status = order.status
      
      const response = await fetch('/api/admin/orders/send-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber,
          customerName,
          status,
          customerEmail: order.user_id // We'll need to get the actual email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      toast.success(`Status email sent to customer`)
    } catch (error) {
      console.error('Error sending status email:', error)
      toast.error('Failed to send status email')
    } finally {
      setSendingEmail(false)
    }
  }

  const printShippingLabel = async () => {
    if (!order) return

    setPrintingLabel(true)
    try {
      // Generate shipping label data
      const labelData = {
        orderNumber: order.order_number,
        shippingAddress: {
          name: `${order.shipping_first_name} ${order.shipping_last_name}`,
          company: order.shipping_company,
          line1: order.shipping_address_line_1,
          line2: order.shipping_address_line_2,
          city: order.shipping_city,
          state: order.shipping_state,
          postalCode: order.shipping_postal_code,
          country: order.shipping_country
        },
        items: order.order_items?.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          sku: item.product_sku
        })) || []
      }

      // For now, we'll create a simple print-friendly format
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Shipping Label - ${order.order_number}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .label { border: 2px solid #000; padding: 20px; max-width: 600px; }
                .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .section { margin-bottom: 15px; }
                .items { margin-top: 20px; }
                .item { margin-bottom: 5px; }
              </style>
            </head>
            <body>
              <div class="label">
                <div class="header">SHIPPING LABEL</div>
                <div class="section">
                  <strong>Order #:</strong> ${order.order_number}<br>
                  <strong>Date:</strong> ${new Date().toLocaleDateString()}
                </div>
                <div class="section">
                  <strong>SHIP TO:</strong><br>
                  ${labelData.shippingAddress.name}<br>
                  ${labelData.shippingAddress.company ? labelData.shippingAddress.company + '<br>' : ''}
                  ${labelData.shippingAddress.line1}<br>
                  ${labelData.shippingAddress.line2 ? labelData.shippingAddress.line2 + '<br>' : ''}
                  ${labelData.shippingAddress.city}, ${labelData.shippingAddress.state} ${labelData.shippingAddress.postalCode}<br>
                  ${labelData.shippingAddress.country}
                </div>
                <div class="items">
                  <strong>ITEMS:</strong><br>
                  ${labelData.items.map(item => 
                    `<div class="item">${item.quantity}x ${item.name} (${item.sku})</div>`
                  ).join('')}
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }

      toast.success('Shipping label opened for printing')
    } catch (error) {
      console.error('Error printing shipping label:', error)
      toast.error('Failed to generate shipping label')
    } finally {
      setPrintingLabel(false)
    }
  }

  const viewProduct = (productId: string) => {
    // Navigate to product detail page
    window.open(`/admin/products/${productId}`, '_blank')
  }

  const viewCustomerProfile = async () => {
    if (!order?.user_id) return
    
    try {
      // Fetch customer data via API
      const response = await fetch(`/api/admin/customers/${order.user_id}`, {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const customer = data.customer
        const orders = data.orders
        
        const customerName = customer.full_name || 
          `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 
          `Customer ${customer.id.substring(0, 8)}`
        
        const totalSpent = orders
          .filter((order: any) => order.status !== 'cancelled')
          .reduce((total: number, order: any) => total + order.total_amount, 0)
        
        const customerInfo = `
          Customer Profile
          ================
          Name: ${customerName}
          Customer ID: ${customer.id}
          Role: ${customer.role}
          Phone: ${customer.phone || 'Not provided'}
          
          Account Info:
          Member since: ${new Date(customer.created_at).toLocaleDateString()}
          Total orders: ${orders.length}
          Total spent: $${totalSpent.toFixed(2)}
          
          Recent Orders:
          ${orders.slice(0, 3).map((order: any) => 
            `• #${order.order_number} - ${order.status} - $${order.total_amount.toFixed(2)} (${new Date(order.created_at).toLocaleDateString()})`
          ).join('\n          ')}
          ${orders.length > 3 ? `\n          ... and ${orders.length - 3} more orders` : ''}
        `
        
        alert(customerInfo)
      } else {
        toast.error('Failed to load customer profile')
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error)
      toast.error('Failed to load customer profile')
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
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Order Details" description="Manage order information" />
        <main className="flex-1 p-6">
          <div className="max-w-6xl space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Order Not Found" description="The order you're looking for doesn't exist" />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title={`Order #${order.order_number}`}
        description={`Placed on ${new Date(order.created_at).toLocaleDateString()}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <div className="max-w-6xl space-y-6">
          {/* Status and Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>Current status and quick actions</CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={order.status} onValueChange={updateOrderStatus} disabled={updating}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  disabled={updating || sendingEmail}
                  onClick={sendStatusEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingEmail ? 'Sending...' : 'Send Status Email'}
                </Button>
                <Button 
                  variant="outline" 
                  disabled={updating || printingLabel}
                  onClick={printShippingLabel}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {printingLabel ? 'Generating...' : 'Print Shipping Label'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items ({order.order_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(order.order_items || []).map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-b-0">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image 
                          src={item.products?.images?.[0] || "/diverse-products-still-life.png"} 
                          alt={item.product_name || 'Product'} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-2">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.unit_price || 0).toFixed(2)} × {item.quantity || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.total_price || 0).toFixed(2)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => viewProduct(item.product_id)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Product
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Admin Notes
                  </CardTitle>
                  <CardDescription>Internal notes for this order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add internal notes about this order..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={updateOrderNotes} disabled={updating}>
                    Update Notes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">
                      {order.shipping_first_name} {order.shipping_last_name}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto text-xs"
                      onClick={viewCustomerProfile}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Customer Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                      <span>${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{(order.shipping_amount || 0) === 0 ? "Free" : `$${(order.shipping_amount || 0).toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${(order.tax_amount || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${(order.total_amount || 0).toFixed(2)}</span>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
