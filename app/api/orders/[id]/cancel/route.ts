import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id

  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: "Order ID is required" },
      { status: 400 }
    )
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase configuration" },
      { status: 500 }
    )
  }

  // Verify the current user is authenticated
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized - Please log in" },
      { status: 401 }
    )
  }

  // Use service role to bypass RLS for order operations
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // First, get the order and verify it belongs to the user
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { ok: false, error: "Order not found or access denied" },
        { status: 404 }
      )
    }

    // Check if order can be cancelled based on status
    const cancellableStatuses = ["pending", "confirmed"]
    const nonCancellableStatuses = ["processing", "shipped", "delivered", "cancelled"]

    if (!cancellableStatuses.includes(order.status)) {
      const statusMessages = {
        processing: "Order is currently being processed and cannot be cancelled. Please contact customer support.",
        shipped: "Order has been shipped and cannot be cancelled. You may return it after delivery.",
        delivered: "Order has been delivered. You may return it following our return policy.",
        cancelled: "Order has already been cancelled."
      }

      return NextResponse.json(
        { 
          ok: false, 
          error: statusMessages[order.status as keyof typeof statusMessages] || "Order cannot be cancelled at this time",
          status: order.status,
          canCancel: false
        },
        { status: 400 }
      )
    }

    // Parse the cancellation reason from request body
    const body = await req.json().catch(() => ({}))
    const cancellationReason = body.reason || "Customer requested cancellation"

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        notes: order.notes 
          ? `${order.notes}\n\nCancelled: ${cancellationReason}` 
          : `Cancelled: ${cancellationReason}`
      })
      .eq("id", orderId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error cancelling order:", updateError)
      return NextResponse.json(
        { ok: false, error: "Failed to cancel order. Please try again." },
        { status: 500 }
      )
    }

    // Log the cancellation for admin tracking
    console.log(`Order ${order.order_number} cancelled by user ${user.id}: ${cancellationReason}`)

    // TODO: If payment was processed, initiate refund here
    // This would integrate with your payment processor (Stripe, etc.)
    
    // TODO: Send cancellation email to customer
    // await sendOrderCancellationEmail(user.email, updatedOrder)

    // TODO: Notify admin about cancellation
    // await notifyAdminOfCancellation(updatedOrder, cancellationReason)

    return NextResponse.json({
      ok: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
      canCancel: false,
      refundInfo: {
        willBeRefunded: order.total_amount > 0,
        amount: order.total_amount,
        timeframe: "3-5 business days",
        method: "Original payment method"
      }
    })

  } catch (err: any) {
    console.error("Error in order cancellation:", err)
    return NextResponse.json(
      { ok: false, error: "Internal server error. Please contact support." },
      { status: 500 }
    )
  }
}

// GET endpoint to check if an order can be cancelled
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id

  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: "Order ID is required" },
      { status: 400 }
    )
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing configuration" },
      { status: 500 }
    )
  }

  // Verify authentication
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, created_at, order_number")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const cancellableStatuses = ["pending", "confirmed"]
    const canCancel = cancellableStatuses.includes(order.status)

    // Calculate time since order was placed
    const orderDate = new Date(order.created_at)
    const now = new Date()
    const hoursElapsed = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)

    return NextResponse.json({
      ok: true,
      canCancel,
      status: order.status,
      orderNumber: order.order_number,
      hoursElapsed: Math.round(hoursElapsed * 10) / 10,
      cancellationWindow: canCancel ? "Available now" : "No longer available",
      reason: canCancel 
        ? "Order can be cancelled" 
        : `Cannot cancel ${order.status} orders`
    })

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Failed to check order status" },
      { status: 500 }
    )
  }
}
