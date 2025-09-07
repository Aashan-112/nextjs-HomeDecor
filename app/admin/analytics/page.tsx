"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  topProducts: Array<{
    id: string
    name: string
    total_sold: number
    revenue: number
  }>
  recentSales: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createClient()

      try {
        const now = new Date()
        const daysAgo = new Date(now.getTime() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)

        // Get current period data
        const [
          { data: orders },
          { data: allOrders },
          { count: totalCustomers },
          { count: totalProducts },
          { data: orderItems },
        ] = await Promise.all([
          supabase.from("orders").select("total_amount, created_at").gte("created_at", daysAgo.toISOString()),
          supabase.from("orders").select("total_amount, created_at"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase
            .from("order_items")
            .select("product_id, product_name, quantity, total_price")
            .gte("created_at", daysAgo.toISOString()),
        ])

        // Calculate metrics
        const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const totalOrders = orders?.length || 0

        // Calculate growth (comparing to previous period)
        const previousPeriodStart = new Date(daysAgo.getTime() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)
        const previousOrders =
          allOrders?.filter(
            (order) => new Date(order.created_at) >= previousPeriodStart && new Date(order.created_at) < daysAgo,
          ) || []

        const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
        const ordersGrowth =
          previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0

        // Top products
        const productSales =
          orderItems?.reduce(
            (acc, item) => {
              if (!acc[item.product_id]) {
                acc[item.product_id] = {
                  id: item.product_id,
                  name: item.product_name,
                  total_sold: 0,
                  revenue: 0,
                }
              }
              acc[item.product_id].total_sold += item.quantity
              acc[item.product_id].revenue += item.total_price
              return acc
            },
            {} as Record<string, any>,
          ) || {}

        const topProducts = Object.values(productSales)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5)

        // Recent sales (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dayOrders =
            orders?.filter((order) => new Date(order.created_at).toDateString() === date.toDateString()) || []

          return {
            date: date.toLocaleDateString(),
            revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
            orders: dayOrders.length,
          }
        }).reverse()

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalCustomers: totalCustomers || 0,
          totalProducts: totalProducts || 0,
          revenueGrowth,
          ordersGrowth,
          customersGrowth: 0, // Would need historical data
          topProducts,
          recentSales: last7Days,
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Analytics" description="Store performance insights" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Analytics" description="Store performance insights" />

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex justify-between items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.totalRevenue.toFixed(2)}</div>
                <div className="flex items-center text-xs">
                  {(analytics?.revenueGrowth ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={(analytics?.revenueGrowth ?? 0) >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(analytics?.revenueGrowth || 0).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalOrders}</div>
                <div className="flex items-center text-xs">
                  {analytics?.ordersGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={analytics?.ordersGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(analytics?.ordersGrowth || 0).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Total registered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalProducts}</div>
                <p className="text-xs text-muted-foreground">In catalog</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
                <CardDescription>Revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentSales.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{day.date}</p>
                        <p className="text-xs text-muted-foreground">{day.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${day.revenue.toFixed(2)}</p>
                        <div className="w-24 bg-muted rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((day.revenue / Math.max(...(analytics?.recentSales?.map((d) => d.revenue) || [1]))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.total_sold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {analytics?.topProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
