import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('🚨 [ORDER API] API endpoint called with params:', params)
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('🔍 [ORDER API] Fetching order:', params?.id)
    console.log('🔍 [ORDER API] Env check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    })

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [ORDER API] Missing Supabase env vars')
      return NextResponse.json(
        { ok: false, error: "Missing Supabase configuration" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log('🔧 [ORDER API] Supabase client created successfully')
    console.log('🔧 [ORDER API] Querying for order ID:', params?.id)

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, price, images)
        )
      `)
      .eq('id', params?.id)
      .single()

    console.log('📊 [ORDER API] Query result:', {
      hasData: !!order,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message
    })

    if (error) {
      console.error('🚨 [ORDER API] Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Check if it's a "not found" error
      if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
        return NextResponse.json(
          { ok: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { ok: false, error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    console.log('✅ [ORDER API] Order fetched successfully:', order?.id)
    return NextResponse.json({ ok: true, order })

  } catch (error: any) {
    console.error('🚨 [ORDER API] Unexpected error details:', {
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
