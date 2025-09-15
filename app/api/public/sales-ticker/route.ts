import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

interface SalesTickerItem {
  type: "sale" | "stat" | "promo"
  message: string
  icon?: string
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      // Fallback to demo data if no database connection
      const demoData: SalesTickerItem[] = [
        { type: "sale", message: "🎉 Sarah from New York just purchased a Rustic Wooden Mirror!", icon: "🛒" },
        { type: "stat", message: "💰 Today's Revenue: $2,847.50", icon: "💵" },
        { type: "sale", message: "🔥 Michael from Texas bought 2x Ceramic Vase Collection!", icon: "🛒" },
        { type: "stat", message: "📦 127 Orders Processed This Week", icon: "📊" },
        { type: "promo", message: "🎁 Free Shipping on Orders Over $75!", icon: "🚚" },
        { type: "sale", message: "⭐ Emma from California loves her Handwoven Rattan Chair!", icon: "🛒" },
        { type: "stat", message: "🏆 1,247+ Happy Customers", icon: "❤️" },
        { type: "promo", message: "✨ New Arrivals: Spring Collection Now Available!", icon: "🌸" }
      ]
      return NextResponse.json(demoData)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch recent sales data
    const [
      { data: recentOrders },
      { data: todayOrders },
      { data: weekOrders },
      { count: totalCustomers }
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total_amount, shipping_first_name, shipping_city, created_at, order_items(product_name, quantity)")
        .gte("created_at", last24Hours.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()),
      supabase
        .from("orders")
        .select("id")
        .gte("created_at", lastWeek.toISOString()),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
    ])

    const tickerItems: SalesTickerItem[] = []

    // Add recent sales
    if (recentOrders && recentOrders.length > 0) {
      recentOrders.slice(0, 5).forEach(order => {
        const firstName = order.shipping_first_name || "Someone"
        const city = order.shipping_city || "Unknown"
        const productName = order.order_items?.[0]?.product_name || "an item"
        const quantity = order.order_items?.[0]?.quantity || 1
        
        const quantityText = quantity > 1 ? `${quantity}x ` : ""
        tickerItems.push({
          type: "sale",
          message: `🎉 ${firstName} from ${city} just purchased ${quantityText}${productName}!`,
          icon: "🛒"
        })
      })
    }

    // Add today's revenue
    if (todayOrders && todayOrders.length > 0) {
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
      tickerItems.push({
        type: "stat",
        message: `💰 Today's Revenue: $${todayRevenue.toFixed(2)}`,
        icon: "💵"
      })
    }

    // Add weekly orders count
    if (weekOrders && weekOrders.length > 0) {
      tickerItems.push({
        type: "stat",
        message: `📦 ${weekOrders.length} Orders Processed This Week`,
        icon: "📊"
      })
    }

    // Add total customers
    if (totalCustomers && totalCustomers > 0) {
      tickerItems.push({
        type: "stat",
        message: `🏆 ${totalCustomers.toLocaleString()}+ Happy Customers`,
        icon: "❤️"
      })
    }

    // Add promotional messages
    tickerItems.push(
      { type: "promo", message: "🎁 Free Shipping on Orders Over $75!", icon: "🚚" },
      { type: "promo", message: "✨ New Arrivals: Spring Collection Now Available!", icon: "🌸" },
      { type: "promo", message: "⚡ Limited Time: 15% Off All Mirrors!", icon: "🏷️" }
    )

    // If no real data, add some demo messages
    if (tickerItems.length === 0) {
      tickerItems.push(
        { type: "promo", message: "🎉 Welcome to our handcrafted furniture store!", icon: "🏠" },
        { type: "promo", message: "✨ Each piece is uniquely made by skilled artisans", icon: "👨‍🎨" },
        { type: "promo", message: "🚚 Free shipping on orders over $75", icon: "📦" }
      )
    }

    return NextResponse.json(tickerItems)
  } catch (error) {
    console.error("Error fetching sales ticker data:", error)
    
    // Return demo data on error
    const demoData: SalesTickerItem[] = [
      { type: "promo", message: "🎉 Welcome to our handcrafted furniture store!", icon: "🏠" },
      { type: "promo", message: "✨ Each piece is uniquely made by skilled artisans", icon: "👨‍🎨" },
      { type: "promo", message: "🚚 Free shipping on orders over $75", icon: "📦" }
    ]
    return NextResponse.json(demoData)
  }
}
