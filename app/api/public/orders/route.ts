import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.orderData || !body.orderItems) {
      return NextResponse.json(
        { error: "Order data and items are required" },
        { status: 400 }
      )
    }

    // Create Supabase service role client for bypassing RLS
    const supabase = createServiceRoleClient()
    
    // Handle guest user_id for anonymous orders by ensuring guest user exists
    const orderData = { ...body.orderData }
    const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    if (orderData.user_id === GUEST_USER_ID) {
      
      // Try to ensure guest user exists in profiles table
      try {
        // First, check if guest profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', GUEST_USER_ID)
          .single()
          
        if (!existingProfile) {
          console.log('API: Guest profile not found, creating...')
          
          // Create guest profile
          await supabase
            .from('profiles')
            .insert({
              id: GUEST_USER_ID,
              first_name: 'Guest',
              last_name: 'User',
              role: 'guest'
            })
          console.log('API: Guest profile created successfully')
        }
      } catch (error) {
        console.error('API: Error handling guest profile:', error)
        // Continue with the operation anyway
      }
      
      console.log('API: Creating guest order with guest user ID')
    }

    // Create the order using service role
    console.log('API: Creating order with data:', orderData)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('API: Order creation failed:', orderError)
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      )
    }

    console.log('API: Order created successfully:', order)

    // Create order items
    const orderItemsWithOrderId = body.orderItems.map((item: any) => ({
      ...item,
      order_id: order.id
    }))

    console.log('API: Creating order items:', orderItemsWithOrderId)
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('API: Order items creation failed:', itemsError)
      // Try to clean up the order if items failed
      await supabase.from("orders").delete().eq("id", order.id)
      
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      )
    }

    console.log('API: Order and items created successfully')

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
