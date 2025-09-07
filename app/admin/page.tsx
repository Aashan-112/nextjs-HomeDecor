"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: any[]
  lowStockProducts: any[]
  monthlyRevenue?: Array<{ month: string; revenue: number }>
  ordersByStatus?: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  growth?: {
    revenue: number
    orders: number
    customers: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  
  console.log('📝 [DASHBOARD] Component render - loading:', loading, 'stats exists:', !!stats)

  useEffect(() => {
    console.log('🚀 [DASHBOARD] useEffect triggered - setting up initial fetch')
    let cancelled = false

    const runFetch = async () => {
      console.log('🚀 [DASHBOARD] runFetch called, cancelled:', cancelled)
      if (!cancelled) {
        console.log('🚀 [DASHBOARD] About to call fetchDashboardStats...')
        await fetchDashboardStats()
        console.log('🚀 [DASHBOARD] fetchDashboardStats completed')
      }
    }

    console.log('🚀 [DASHBOARD] About to call runFetch...')
    runFetch()
    console.log('🚀 [DASHBOARD] runFetch called')

    // Auto-refresh every 1 minute for real-time updates
    const refreshInterval = setInterval(() => {
      if (!cancelled) {
        console.log('🔄 [DASHBOARD] Auto-refreshing stats...')
        fetchDashboardStats(true) // Silent background refresh
      }
    }, 60 * 1000) // 1 minute

    // Safety timeout to avoid indefinite skeletons in dev  
    const t = setTimeout(() => { 
      if (!cancelled) {
        console.log('⏰ [DASHBOARD] Safety timeout triggered - forcing loading to false')
        setLoading(false) 
      }
    }, 5000) // Reduced to 5 seconds
    
    // Additional immediate timeout for testing
    const immediateTimeout = setTimeout(() => {
      if (!cancelled && !stats) {
        console.log('⚡ [DASHBOARD] Immediate timeout - testing loading state force')
        setLoading(false)
      }
    }, 2000) // 2 seconds
    
    return () => { 
      cancelled = true
      clearTimeout(t)
      clearTimeout(immediateTimeout)
      clearInterval(refreshInterval)
      console.log('🧽 [DASHBOARD] Cleanup function called')
    }
  }, [router])

  const handleManualRefresh = async () => {
    console.log('🔄 [DASHBOARD] Manual refresh triggered')
    await fetchDashboardStats(false)
  }

  const fetchDashboardStats = async (silent: boolean = false) => {
    console.log('🚨 [DASHBOARD] FUNCTION ENTRY - fetchDashboardStats called with silent:', silent)
    
    try {
      console.log(`📊 [DASHBOARD] Starting fetch (silent: ${silent})`)
      console.log('📊 [DASHBOARD] Current loading state:', loading)
      console.log('📊 [DASHBOARD] Current stats state:', stats)
      
      if (!silent) {
        console.log('📊 [DASHBOARD] Setting isRefreshing to true')
        setIsRefreshing(true)
      }
      
      console.log('📊 [DASHBOARD] About to create Supabase client...')
      const supabase = createClient()
      console.log('📊 [DASHBOARD] Supabase client created successfully')

      try {
        console.log('📊 [DASHBOARD] About to call supabase.auth.getUser()...')
        
        // Add timeout wrapper for auth call
        const authTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
        )
        
        const authPromise = supabase.auth.getUser()
        
        console.log('📊 [DASHBOARD] Racing auth call against timeout...')
        
        let authResult
        try {
          authResult = await Promise.race([authPromise, authTimeout])
        } catch (timeoutError) {
          console.error('⏰ [DASHBOARD] Auth call timed out:', timeoutError)
          
          // Try alternative: skip auth and use API with service key
          console.log('🔄 [DASHBOARD] Trying alternative approach: direct API call...')
          console.log('🔄 [DASHBOARD] About to make fetch request to /api/admin/dashboard')
          
          try {
            const dashboardResponse = await fetch('/api/admin/dashboard', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            })
            
            console.log('📊 [DASHBOARD] API response received, status:', dashboardResponse.status)
            
            if (dashboardResponse.ok) {
              console.log('📊 [DASHBOARD] API response is OK, parsing JSON...')
              const dashboardData = await dashboardResponse.json()
              console.log('✅ [DASHBOARD] API fallback successful with data:')
              console.log('  - Products:', dashboardData.totalProducts)
              console.log('  - Orders:', dashboardData.totalOrders) 
              console.log('  - Customers:', dashboardData.totalCustomers)
              console.log('  - Revenue:', dashboardData.totalRevenue)
              
              setStats(dashboardData)
              setLastUpdated(new Date())
              setLoading(false)
              setIsRefreshing(false)
              console.log('✅ [DASHBOARD] All states updated, should render with data now')
              return
            } else {
              const errorText = await dashboardResponse.text()
              console.error('❌ [DASHBOARD] API fallback failed:')
              console.error('  - Status:', dashboardResponse.status)
              console.error('  - Status Text:', dashboardResponse.statusText)
              console.error('  - Response body:', errorText)
              throw new Error(`API fallback failed: ${dashboardResponse.status} - ${errorText}`)
            }
          } catch (fetchError) {
            console.error('🚨 [DASHBOARD] Fetch error in API fallback:', fetchError)
            throw fetchError
          }
        }
        
        const { data: { user }, error: authError } = authResult
        
        console.log('🔐 [DASHBOARD] Auth check completed:')
        console.log('  - User exists:', !!user)
        console.log('  - User ID:', user?.id)
        console.log('  - Auth error:', authError)
        
        if (authError) {
          console.error('❌ [DASHBOARD] Authentication error:', JSON.stringify(authError, null, 2))
          setLoading(false)
          return
        }
      
      if (!user) {
        console.log('⚠️ [DASHBOARD] No user, redirecting to login')
        setLoading(false)
        router.replace('/auth/login?redirect=/admin')
        return
      }

      // Check admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      
      console.log('👤 [DASHBOARD] Profile check:', { profile, error: profileError })
      
      if (profile?.role !== 'admin') {
        console.log('⚠️ [DASHBOARD] Not admin, redirecting')
        setLoading(false)
        router.replace('/')
        return
      }

      console.log('✅ [DASHBOARD] User is admin, fetching stats...')
      
      // Try direct queries first for simplicity
      console.log('📊 [DASHBOARD] Using direct Supabase queries')
      
      const [
        prodRes,
        ordersCountRes,
        customersCountRes,
        revenueRes,
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount").eq('status', 'delivered'),
      ])

      console.log('🔍 [DASHBOARD] Query results:')
      console.log('  - Products:', { count: prodRes.count, error: prodRes.error })
      console.log('  - Orders:', { count: ordersCountRes.count, error: ordersCountRes.error }) 
      console.log('  - Customers:', { count: customersCountRes.count, error: customersCountRes.error })
      console.log('  - Revenue:', { dataLength: revenueRes.data?.length, error: revenueRes.error })

      const totalProducts = prodRes.count || 0
      const totalOrders = ordersCountRes.count || 0
      const totalCustomers = customersCountRes.count || 0
      const orders = revenueRes.data || []
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0)

      const newStats = {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        recentOrders: [],
        lowStockProducts: [],
      }
      
      console.log('📊 [DASHBOARD] Calculated stats:', newStats)
      console.log('📊 [DASHBOARD] About to call setStats...')
      
      setStats(newStats)
      console.log('📊 [DASHBOARD] setStats called successfully')
      
      setLastUpdated(new Date())
      console.log('📊 [DASHBOARD] setLastUpdated called successfully')
      
      // Force loading to false immediately
      console.log('🎆 [DASHBOARD] About to set loading to false...')
      setLoading(false)
      console.log('🎆 [DASHBOARD] setLoading(false) called successfully')
      
      console.log('✅ [DASHBOARD] Stats updated successfully')
      
    } catch (error) {
      console.error("❌ [DASHBOARD] Error in fetchDashboardStats:", error)
      console.error("❌ [DASHBOARD] Error type:", typeof error)
      console.error("❌ [DASHBOARD] Error message:", error instanceof Error ? error.message : String(error))
      console.error("❌ [DASHBOARD] Error stack:", error instanceof Error ? error.stack : 'No stack trace')
      
      // Set some default stats to show something
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
      })
    } finally {
      console.log('🏁 [DASHBOARD] Finally block - clearing loading states')
      setLoading(false)
      setIsRefreshing(false)
    }
    } catch (outerError) {
      console.error('🚨 [DASHBOARD] OUTER ERROR - Function level error:', outerError)
      console.error('🚨 [DASHBOARD] OUTER ERROR - Type:', typeof outerError)
      console.error('🚨 [DASHBOARD] OUTER ERROR - Message:', outerError instanceof Error ? outerError.message : String(outerError))
      console.error('🚨 [DASHBOARD] OUTER ERROR - Stack:', outerError instanceof Error ? outerError.stack : 'No stack trace')
      
      // Force stats to show zeros
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
      })
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  console.log('🔍 [DASHBOARD] Render - loading:', loading, 'stats:', !!stats)
  
  if (loading) {
    console.log('😌 [DASHBOARD] Showing loading skeleton')
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" description="Overview of your store performance" />
        <main className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    )
  }

  console.log('🎆 [DASHBOARD] Rendering main dashboard with stats:', stats)
  
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Dashboard" 
        description={`Overview of your store performance - Last updated: ${lastUpdated.toLocaleTimeString()}`}
        action={
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {isRefreshing && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats !== null ? (stats.totalProducts ?? 0) : (
                  <div className="animate-pulse bg-muted rounded w-8 h-8">Loading...</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats !== null ? (stats.totalOrders ?? 0) : (
                  <div className="animate-pulse bg-muted rounded w-8 h-8">Loading...</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats !== null ? (stats.totalCustomers ?? 0) : (
                  <div className="animate-pulse bg-muted rounded w-8 h-8">Loading...</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats !== null ? `$${(stats.totalRevenue ?? 0).toFixed(2)}` : (
                  <div className="animate-pulse bg-muted rounded w-16 h-8">Loading...</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.growth?.revenue ? (
                  <>
                    <TrendingUp className={`inline h-3 w-3 mr-1 ${stats.growth.revenue >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    {stats.growth.revenue >= 0 ? '+' : ''}{stats.growth.revenue.toFixed(1)}% from last month
                  </>
                ) : (
                  <>
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    All time revenue
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Breakdown */}
        {stats?.ordersByStatus && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Current distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.ordersByStatus.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ordersByStatus.processing}</div>
                  <div className="text-xs text-muted-foreground">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.ordersByStatus.shipped}</div>
                  <div className="text-xs text-muted-foreground">Shipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.ordersByStatus.delivered}</div>
                  <div className="text-xs text-muted-foreground">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.ordersByStatus.cancelled}</div>
                  <div className="text-xs text-muted-foreground">Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Order #{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total_amount.toFixed(2)}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                              ? "secondary"
                              : order.status === "processing"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {stats?.recentOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/admin/orders">View All Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={product.stock_quantity === 0 ? "destructive" : "outline"}>
                        {product.stock_quantity} left
                      </Badge>
                    </div>
                  </div>
                ))}
                {stats?.lowStockProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/admin/products">Manage Inventory</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
