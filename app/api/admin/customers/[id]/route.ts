import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('👥 [CUSTOMER API] Customer detail endpoint called with params:', params)
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('🔍 [CUSTOMER API] Fetching customer:', params?.id)
    console.log('🔍 [CUSTOMER API] Env check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    })

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [CUSTOMER API] Missing Supabase env vars')
      return NextResponse.json(
        { ok: false, error: "Missing Supabase configuration" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('🔧 [CUSTOMER API] Supabase client created successfully')
    console.log('🔧 [CUSTOMER API] Querying for customer ID:', params?.id)

    // Check if this is a guest user (anonymous UUID)
    const isGuestUser = params?.id === '00000000-0000-0000-0000-000000000000'
    
    let profile = null
    
    if (isGuestUser) {
      console.log('👤 [CUSTOMER API] Detected guest user, fetching data from orders table')
      
      // For guest users, get customer data from the most recent order
      const { data: guestOrderData, error: guestOrderError } = await supabase
        .from('orders')
        .select('customer_email, customer_phone, shipping_first_name, shipping_last_name, created_at')
        .eq('user_id', params?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        
      if (guestOrderError && guestOrderError.code === 'PGRST116') {
        return NextResponse.json(
          { ok: false, error: 'Guest customer not found' },
          { status: 404 }
        )
      }
      
      if (guestOrderError) {
        console.error('🚨 [CUSTOMER API] Error fetching guest order data:', guestOrderError)
        return NextResponse.json(
          { ok: false, error: 'Failed to fetch guest customer data' },
          { status: 500 }
        )
      }
      
      // Create a profile-like object for guest users
      profile = {
        id: params.id,
        email: guestOrderData.customer_email,
        phone: guestOrderData.customer_phone,
        first_name: guestOrderData.shipping_first_name,
        last_name: guestOrderData.shipping_last_name,
        full_name: `${guestOrderData.shipping_first_name || ''} ${guestOrderData.shipping_last_name || ''}`.trim() || null,
        role: 'guest',
        created_at: guestOrderData.created_at,
        updated_at: guestOrderData.created_at
      }
      
      console.log('✅ [CUSTOMER API] Guest user profile created:', {
        email: profile.email,
        phone: profile.phone,
        name: profile.full_name
      })
      
    } else {
      // Regular user - fetch from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params?.id)
        .single()

      console.log('📊 [CUSTOMER API] Profile query result:', {
        hasData: !!profileData,
        hasError: !!profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message
      })

      if (profileError) {
        console.error('🚨 [CUSTOMER API] Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })
        
        // Check if it's a "not found" error
        if (profileError.code === 'PGRST116' || profileError.message?.includes('no rows')) {
          return NextResponse.json(
            { ok: false, error: 'Customer not found' },
            { status: 404 }
          )
        }
        return NextResponse.json(
          { ok: false, error: profileError.message || 'Database error' },
          { status: 500 }
        )
      }
      
      profile = profileData
    }

    // Fetch customer orders
    console.log('📊 [CUSTOMER API] Fetching orders for customer:', params?.id)
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .eq('user_id', params?.id)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('📊 [CUSTOMER API] Orders query result:', {
      hasData: !!orders,
      hasError: !!ordersError,
      orderCount: orders?.length || 0
    })

    // Don't fail if orders can't be fetched, just return empty array
    const customerOrders = ordersError ? [] : (orders || [])

    console.log('✅ [CUSTOMER API] Customer data fetched successfully:', profile?.email || profile?.id)
    
    return NextResponse.json({ 
      ok: true, 
      customer: profile,
      orders: customerOrders
    })

  } catch (error: any) {
    console.error('🚨 [CUSTOMER API] Unexpected error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return NextResponse.json(
      { ok: false, error: error.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
