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
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CustomerProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  created_at: string
  updated_at: string
  role: string
}

interface CustomerOrder {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomer() {
      try {
        console.log('👥 [CUSTOMER DETAIL] Starting to fetch customer:', params.id)
        
        if (!params.id) {
          console.log('❌ [CUSTOMER DETAIL] No customer ID provided')
          setLoading(false)
          return
        }

        console.log('🔧 [CUSTOMER DETAIL] Creating Supabase client')
        const supabase = createClient()
        
        try {
          // Try direct Supabase query first
          console.log('📊 [CUSTOMER DETAIL] Fetching profile for ID:', params.id)
          
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", params.id)
            .single()

          console.log('📊 [CUSTOMER DETAIL] Profile query result:', {
            hasData: !!profile,
            hasError: !!profileError,
            error: profileError
          })

          if (profileError) {
            console.error('❌ [CUSTOMER DETAIL] Direct query failed, trying API fallback:', profileError)
            
            // Try API fallback
            const apiResponse = await fetch(`/api/admin/customers/${params.id}`, {
              method: 'GET',
              credentials: 'include'
            })
            
            if (apiResponse.ok) {
              const apiData = await apiResponse.json()
              console.log('✅ [CUSTOMER DETAIL] API fallback successful:', apiData.customer?.email)
              
              setCustomer(apiData.customer)
              setOrders(apiData.orders || [])
              setLoading(false)
              return
            } else {
              console.error('❌ [CUSTOMER DETAIL] API fallback failed:', apiResponse.status)
              toast.error("Failed to load customer profile")
              setLoading(false)
              return
            }
          }

          console.log('✅ [CUSTOMER DETAIL] Profile fetched successfully:', profile.email)
          setCustomer(profile)

          // Fetch customer orders
          console.log('📊 [CUSTOMER DETAIL] Fetching orders for customer:', params.id)
          
          const { data: customerOrders, error: ordersError } = await supabase
            .from("orders")
            .select("id, order_number, status, total_amount, created_at")
            .eq("user_id", params.id)
            .order("created_at", { ascending: false })
            .limit(10)

          console.log('📊 [CUSTOMER DETAIL] Orders query result:', {
            hasData: !!customerOrders,
            hasError: !!ordersError,
            orderCount: customerOrders?.length || 0,
            error: ordersError
          })

          if (ordersError) {
            console.error('❌ [CUSTOMER DETAIL] Error fetching customer orders:', ordersError)
            // Don't fail the whole page if orders fail
          } else {
            setOrders(customerOrders || [])
          }
          
        } catch (directQueryError) {
          console.error('❌ [CUSTOMER DETAIL] Direct query exception, trying API fallback:', directQueryError)
          
          try {
            const apiResponse = await fetch(`/api/admin/customers/${params.id}`, {
              method: 'GET',
              credentials: 'include'
            })
            
            if (apiResponse.ok) {
              const apiData = await apiResponse.json()
              console.log('✅ [CUSTOMER DETAIL] API fallback successful:', apiData.customer?.email)
              
              setCustomer(apiData.customer)
              setOrders(apiData.orders || [])
              setLoading(false)
              return
            } else {
              console.error('❌ [CUSTOMER DETAIL] API fallback failed:', apiResponse.status)
            }
          } catch (apiError) {
            console.error('❌ [CUSTOMER DETAIL] API fallback exception:', apiError)
          }
          
          toast.error("Failed to load customer profile")
          setLoading(false)
          return
        }

        console.log('✅ [CUSTOMER DETAIL] All data fetched, setting loading to false')
        setLoading(false)

      } catch (error) {
        console.error('❌ [CUSTOMER DETAIL] Unexpected error fetching customer:', error)
        console.error('❌ [CUSTOMER DETAIL] Error stack:', error instanceof Error ? error.stack : 'No stack')
        toast.error("Failed to load customer")
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [params.id])

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

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.total_amount, 0)
  }

  const getCustomerName = () => {
    if (customer?.full_name) return customer.full_name
    if (customer?.first_name || customer?.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
    }
    return customer?.email || `Customer ${customer?.id?.substring(0, 8)}` || 'Unknown Customer'
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Customer Details" description="View customer information" />
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

  if (!customer) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Customer Not Found" description="The customer you're looking for doesn't exist" />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <Button asChild>
              <Link href="/admin/customers">Back to Customers</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title={getCustomerName()}
        description={`Customer since ${new Date(customer.created_at).toLocaleDateString()}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Link>
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <div className="max-w-6xl space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">$</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">${getTotalSpent().toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-lg font-semibold">{new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Recent Orders ({orders.length})
                  </CardTitle>
                  <CardDescription>Latest orders from this customer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            #{order.order_number}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                          <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer Details */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.email ? (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-muted-foreground">Not available</p>
                      </div>
                    </div>
                  )}

                  {customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <Badge variant="outline">{customer.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded">{customer.id}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="font-medium">{new Date(customer.created_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(customer.updated_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/orders?customer=${customer.id}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View All Orders
                      </Link>
                    </Button>
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
