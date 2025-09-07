import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      error: "Missing environment variables",
      supabaseUrl: !!supabaseUrl,
      serviceRoleKey: !!serviceRoleKey
    }, { status: 500 })
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {}
  }

  try {
    // Test 1: Direct service role query (should bypass all RLS)
    console.log('🔍 Test 1: Direct service role query')
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: allProductsService, error: allError } = await serviceSupabase
      .from("products")
      .select("id, name, sku, is_active, is_featured, created_at, category_id")
      .order("created_at", { ascending: false })
      .limit(20)

    results.tests.serviceRoleAll = {
      success: !allError,
      error: allError?.message,
      count: allProductsService?.length || 0,
      products: allProductsService?.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        is_active: p.is_active,
        category_id: p.category_id,
        created_at: p.created_at
      })) || []
    }

    // Test 2: Service role query with is_active = true filter
    console.log('🔍 Test 2: Service role query with is_active filter')
    const { data: activeProductsService, error: activeError } = await serviceSupabase
      .from("products")
      .select("id, name, sku, is_active, is_featured, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10)

    results.tests.serviceRoleActive = {
      success: !activeError,
      error: activeError?.message,
      count: activeProductsService?.length || 0,
      products: activeProductsService?.map(p => ({
        name: p.name,
        sku: p.sku,
        is_active: p.is_active,
        created_at: p.created_at
      })) || []
    }

    // Test 3: Test the exact same query that the public API uses
    console.log('🔍 Test 3: Replicate public API query exactly')
    try {
      const { data: publicApiData, error: publicApiError } = await serviceSupabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      results.tests.publicApiReplication = {
        success: !publicApiError,
        error: publicApiError?.message,
        count: publicApiData?.length || 0,
        latestProducts: publicApiData?.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          is_active: p.is_active,
          created_at: p.created_at,
          price: p.price
        })) || []
      }
    } catch (e: any) {
      results.tests.publicApiReplication = {
        success: false,
        error: e.message
      }
    }

    // Test 4: Test RLS policies with anonymous client
    console.log('🔍 Test 4: Anonymous client (what customers use)')
    try {
      const serverClient = await createServerClient()
      const { data: anonData, error: anonError } = await serverClient
        .from("products")
        .select("id, name, sku, is_active, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5)

      results.tests.anonymousClient = {
        success: !anonError,
        error: anonError?.message,
        count: anonData?.length || 0,
        products: anonData?.map(p => ({
          name: p.name,
          sku: p.sku,
          is_active: p.is_active,
          created_at: p.created_at
        })) || []
      }
    } catch (e: any) {
      results.tests.anonymousClient = {
        success: false,
        error: e.message
      }
    }

    // Test 5: Check categories
    console.log('🔍 Test 5: Check categories')
    const { data: categories, error: catError } = await serviceSupabase
      .from("categories")
      .select("id, name")
      .order("name")

    results.tests.categories = {
      success: !catError,
      error: catError?.message,
      count: categories?.length || 0,
      categories: categories || []
    }

    // Test 6: Call our own public API internally
    console.log('🔍 Test 6: Internal API call')
    try {
      const apiResponse = await fetch(`${req.nextUrl.origin}/api/public/products`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        results.tests.internalApiCall = {
          success: true,
          count: apiData?.length || 0,
          latestProducts: apiData?.slice(0, 3).map((p: any) => ({
            name: p.name,
            sku: p.sku,
            is_active: p.is_active,
            created_at: p.created_at
          })) || []
        }
      } else {
        results.tests.internalApiCall = {
          success: false,
          error: `HTTP ${apiResponse.status}`,
          response: await apiResponse.text()
        }
      }
    } catch (e: any) {
      results.tests.internalApiCall = {
        success: false,
        error: e.message
      }
    }

    // Summary
    results.summary = {
      totalProductsInDb: results.tests.serviceRoleAll.count,
      activeProductsInDb: results.tests.serviceRoleActive.count,
      productsReturnedByPublicApi: results.tests.internalApiCall.count || 0,
      productsReturnedByAnonClient: results.tests.anonymousClient.count || 0,
      categoriesAvailable: results.tests.categories.count,
      
      issues: []
    }

    // Detect issues
    if (results.tests.serviceRoleAll.count === 0) {
      results.summary.issues.push("❌ NO PRODUCTS IN DATABASE AT ALL")
    }
    
    if (results.tests.serviceRoleActive.count === 0) {
      results.summary.issues.push("❌ NO ACTIVE PRODUCTS (is_active = false for all products)")
    }
    
    if (results.tests.serviceRoleAll.count > 0 && results.tests.serviceRoleActive.count === 0) {
      results.summary.issues.push("⚠️ PRODUCTS EXIST BUT NONE ARE ACTIVE - Check is_active field")
    }
    
    if (!results.tests.anonymousClient.success) {
      results.summary.issues.push("❌ RLS POLICY BLOCKING ANONYMOUS ACCESS")
    }
    
    if (!results.tests.internalApiCall.success) {
      results.summary.issues.push("❌ PUBLIC API ENDPOINT NOT WORKING")
    }
    
    if (results.tests.serviceRoleActive.count > results.tests.internalApiCall.count) {
      results.summary.issues.push("⚠️ PUBLIC API RETURNING FEWER PRODUCTS THAN EXPECTED")
    }

    if (results.tests.categories.count === 0) {
      results.summary.issues.push("⚠️ NO CATEGORIES FOUND")
    }

    if (results.summary.issues.length === 0) {
      results.summary.issues.push("✅ NO OBVIOUS ISSUES DETECTED - Check client-side caching")
    }

    return NextResponse.json(results)

  } catch (err: any) {
    console.error('Diagnosis error:', err)
    return NextResponse.json({
      error: "Diagnosis failed",
      message: err.message,
      results
    }, { status: 500 })
  }
}
