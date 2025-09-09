import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 }
    )
  }

  try {
    // Use service role to bypass RLS
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Get all products (bypassing RLS)
    const { data: allProducts, error: allError } = await serviceSupabase
      .from("products")
      .select("id, name, sku, is_active, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get only active products (what public should see)
    const { data: activeProducts, error: activeError } = await serviceSupabase
      .from("products")
      .select("id, name, sku, is_active, is_featured, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10)

    // Test the public API endpoint
    let publicApiResponse = null
    let publicApiError = null
    try {
      const publicRes = await fetch(`${req.nextUrl.origin}/api/public/products`)
      if (publicRes.ok) {
        const publicData = await publicRes.json()
        publicApiResponse = publicData.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          is_active: p.is_active,
          is_featured: p.is_featured
        }))
      } else {
        publicApiError = `HTTP ${publicRes.status}`
      }
    } catch (e: any) {
      publicApiError = e.message
    }

    // Test anonymous client access (what the fallback uses)
    const anonSupabase = await createServerClient()
    const { data: anonProducts, error: anonError } = await anonSupabase
      .from("products")
      .select("id, name, sku, is_active, is_featured, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5)

    return NextResponse.json({
      debug: {
        timestamp: new Date().toISOString(),
        serviceRoleQuery: {
          allProducts: {
            count: allProducts?.length || 0,
            data: allProducts || [],
            error: allError
          },
          activeProducts: {
            count: activeProducts?.length || 0,
            data: activeProducts || [],
            error: activeError
          }
        },
        publicApi: {
          data: publicApiResponse,
          error: publicApiError
        },
        anonymousClient: {
          count: anonProducts?.length || 0,
          data: anonProducts || [],
          error: anonError
        }
      }
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || String(err) },
      { status: 500 }
    )
  }
}
