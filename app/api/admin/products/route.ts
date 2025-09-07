import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { ProductEventEmitter } from "@/app/api/products/stream/route"

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

  // Use service role to bypass RLS and get all products
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

  try {
    const productData = await req.json()
    console.log('🗺 Server received product data:', productData)
    
    // Basic validation
    if (!productData.name || productData.price === undefined || !productData.sku) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, price, sku" },
        { status: 400 }
      )
    }

    // Clean up the data - ensure empty strings become null for UUID fields
    let categoryId = productData.category_id && productData.category_id.trim() !== "" ? productData.category_id.trim() : null
    
    // Use service role to bypass RLS for category lookup
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // WORKAROUND: If no category is provided, try to get the first available category
    // This is a temporary fix until the database constraint is updated
    if (!categoryId) {
      console.log('No category provided, looking for default category...')
      const { data: categories, error: categoryError } = await supabase
        .from("categories")
        .select("id, name")
        .limit(1)
      
      if (categoryError) {
        console.error('Error fetching categories:', categoryError)
        return NextResponse.json(
          { ok: false, error: "Unable to assign a default category. Please select a category or contact administrator." },
          { status: 400 }
        )
      }
      
      if (categories && categories.length > 0) {
        categoryId = categories[0].id
        console.log(`Assigned default category: ${categories[0].name} (${categoryId})`)
      } else {
        return NextResponse.json(
          { ok: false, error: "No categories available. Please create a category first." },
          { status: 400 }
        )
      }
    }
    
    // Validate UUID format for category_id if provided
    if (categoryId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(categoryId)) {
        return NextResponse.json(
          { ok: false, error: "Invalid category ID format" },
          { status: 400 }
        )
      }
    }
    
    const cleanedData = {
      name: productData.name?.trim(),
      description: productData.description && productData.description.trim() !== "" ? productData.description.trim() : null,
      price: parseFloat(productData.price),
      compare_at_price: productData.compare_at_price && productData.compare_at_price !== "" ? parseFloat(productData.compare_at_price) : null,
      sku: productData.sku?.trim(),
      stock_quantity: parseInt(productData.stock_quantity) || 0,
      category_id: categoryId,
      is_active: Boolean(productData.is_active),
      is_featured: Boolean(productData.is_featured),
      images: Array.isArray(productData.images) ? productData.images : [],
      materials: Array.isArray(productData.materials) ? productData.materials : [],
      colors: Array.isArray(productData.colors) ? productData.colors : [],
      weight: productData.weight && productData.weight !== "" ? parseFloat(productData.weight) : null,
      dimensions: productData.dimensions && (productData.dimensions.length || productData.dimensions.width || productData.dimensions.height) ? productData.dimensions : null
    }
    
    console.log('🏛️ Inserting cleaned data:', cleanedData)
    
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...cleanedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    console.log('📤 Database response:', { data, error })

    if (error) throw error

    console.log('🎉 Product created successfully! Invalidating cache...')
    
    // 🚀 INSTANT UPDATE: Emit SSE event for real-time updates
    try {
      const emitter = ProductEventEmitter.getInstance()
      emitter.emit('new_product', {
        ...data,
        timestamp: new Date().toISOString()
      })
      console.log('📡 SSE event emitted for new product:', data.name)
    } catch (sseError) {
      console.error('⚠️ Failed to emit SSE event:', sseError)
      // Don't fail the request if SSE fails
    }
    
    // Create response with cache invalidation headers
    const response = NextResponse.json({
      ...data,
      success: true,
      message: `Product "${data?.name}" created successfully and is now live!`
    })
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Product-Updated', 'true')
    response.headers.set('X-Timestamp', new Date().toISOString())
    
    return response
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
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

  try {
    const body = await req.json()
    const { productId, updates } = body

    if (!productId || !updates) {
      return NextResponse.json(
        { ok: false, error: "Missing productId or updates" },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS and update product
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select()
      .single()

    if (error) throw error

    // 🚀 INSTANT UPDATE: Emit SSE event for product updates
    try {
      const emitter = ProductEventEmitter.getInstance()
      emitter.emit('product_updated', {
        ...data,
        timestamp: new Date().toISOString()
      })
      console.log('📡 SSE event emitted for updated product:', data.name)
    } catch (sseError) {
      console.error('⚠️ Failed to emit SSE update event:', sseError)
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
