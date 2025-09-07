import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Get the latest product to check materials and colors
    const { data: latestProduct, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      latest_product: latestProduct,
      materials: latestProduct?.materials || [],
      colors: latestProduct?.colors || [],
      has_materials: Array.isArray(latestProduct?.materials) && latestProduct.materials.length > 0,
      has_colors: Array.isArray(latestProduct?.colors) && latestProduct.colors.length > 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Create a test product with materials and colors
    const testProductData = {
      name: "Test Product with Materials & Colors",
      description: "Test product to verify materials and colors are saved",
      price: 99.99,
      sku: `TEST-${Date.now()}`,
      stock_quantity: 10,
      is_active: true,
      is_featured: false,
      images: [],
      materials: ["Cotton", "Wood", "Metal"],
      colors: ["Red", "Blue", "Natural"],
      weight: 2.5,
      dimensions: {
        length: 10,
        width: 8,
        height: 6
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating test product with data:', testProductData)

    const { data, error } = await supabase
      .from("products")
      .insert(testProductData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Test product created successfully",
      product: data,
      materials_saved: data?.materials || [],
      colors_saved: data?.colors || [],
      materials_count: Array.isArray(data?.materials) ? data.materials.length : 0,
      colors_count: Array.isArray(data?.colors) ? data.colors.length : 0,
    })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err?.message ?? String(err),
      details: err?.details || null,
      hint: err?.hint || null 
    }, { status: 500 })
  }
}
