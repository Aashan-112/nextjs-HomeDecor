import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 }
    )
  }

  // Verify the current user is authenticated and has admin role
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check if user has admin role
  const { data: profile } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Admin access required" },
      { status: 403 }
    )
  }

  // Use service role to bypass RLS and get comprehensive dashboard stats
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    console.log('📊 [DASHBOARD API] Starting comprehensive stats fetch...')
    
    // Get comprehensive dashboard statistics
    const [
      productsResult,
      ordersResult,
      customersResult,
      revenueResult,
      recentOrdersResult,
      lowStockResult,
      monthlyRevenueResult,
      ordersStatusResult
    ] = await Promise.all([
      // Total products count
      supabase
        .from("products")
        .select("*", { count: "exact", head: true }),
      
      // Total orders count
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true }),
      
      // Total customers count
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      
      // Total revenue (delivered orders only)
      supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "delivered"),
      
      // Recent orders with profile info
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10),
      
      // Low stock products
      supabase
        .from("products")
        .select("id, name, sku, stock_quantity, price")
        .lt("stock_quantity", 10)
        .eq("is_active", true)
        .order("stock_quantity", { ascending: true })
        .limit(10),
      
      // Monthly revenue for last 6 months
      supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("status", "delivered")
        .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false }),
      
      // Orders by status
      supabase
        .from("orders")
        .select("status")
    ])

    // Process the results
    console.log('🔍 Raw query results:')
    console.log('  - Products result:', { count: productsResult.count, error: productsResult.error })
    console.log('  - Orders result:', { count: ordersResult.count, error: ordersResult.error })
    console.log('  - Customers result:', { count: customersResult.count, error: customersResult.error })
    console.log('  - Revenue result:', { count: revenueResult.data?.length, error: revenueResult.error })
    
    const totalProducts = productsResult.count || 0
    const totalOrders = ordersResult.count || 0
    const totalCustomers = customersResult.count || 0
    
    // Handle potential errors in individual queries
    if (productsResult.error) {
      console.error('❌ Products query error:', productsResult.error)
    }
    if (ordersResult.error) {
      console.error('❌ Orders count query error:', ordersResult.error)
    }
    if (customersResult.error) {
      console.error('❌ Customers query error:', customersResult.error)
    }
    if (revenueResult.error) {
      console.error('❌ Revenue query error:', revenueResult.error)
    }
    
    const revenueData = revenueResult.data || []
    const totalRevenue = revenueData.reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total_amount) || 0), 0
    )

    const recentOrders = recentOrdersResult.data || []
    const lowStockProducts = lowStockResult.data || []
    
    // Process monthly revenue
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthYear = date.toISOString().slice(0, 7) // YYYY-MM format
      
      const monthRevenue = (monthlyRevenueResult.data || [])
        .filter((order: any) => order.created_at.startsWith(monthYear))
        .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      }
    }).reverse()

    // Process orders by status
    const ordersStatusData = ordersStatusResult.data || []
    const ordersByStatus = {
      pending: ordersStatusData.filter((o: any) => o.status === 'pending').length,
      processing: ordersStatusData.filter((o: any) => o.status === 'processing').length,
      shipped: ordersStatusData.filter((o: any) => o.status === 'shipped').length,
      delivered: ordersStatusData.filter((o: any) => o.status === 'delivered').length,
      cancelled: ordersStatusData.filter((o: any) => o.status === 'cancelled').length,
    }

    // Calculate growth metrics (simplified - comparing with previous period)
    const currentMonth = new Date().toISOString().slice(0, 7)
    const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7)
    
    const currentMonthRevenue = (monthlyRevenueResult.data || [])
      .filter((order: any) => order.created_at.startsWith(currentMonth))
      .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
    
    const previousMonthRevenue = (monthlyRevenueResult.data || [])
      .filter((order: any) => order.created_at.startsWith(previousMonth))
      .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
    
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0

    const dashboardStats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      monthlyRevenue,
      ordersByStatus,
      growth: {
        revenue: revenueGrowth,
        orders: 0, // Could calculate similar to revenue
        customers: 0 // Could calculate similar to revenue
      }
    }

    console.log(`✅ [DASHBOARD API] Stats compiled successfully:`)
    console.log(`   Products: ${totalProducts}, Orders: ${totalOrders}, Customers: ${totalCustomers}`)
    console.log(`   Revenue: $${totalRevenue.toFixed(2)}, Recent Orders: ${recentOrders.length}, Low Stock: ${lowStockProducts.length}`)

    return NextResponse.json(dashboardStats)
  } catch (err: any) {
    console.error('❌ [DASHBOARD API] Error fetching stats:', err)
    console.error('Error details:', err.message, err.stack)
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
