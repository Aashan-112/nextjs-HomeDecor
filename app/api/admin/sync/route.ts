import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { CATEGORIES, ALL_PRODUCTS } from "@/lib/data/products-data"

export async function POST(req: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!syncSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing SYNC_SECRET in environment" },
      { status: 500 },
    )
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    )
  }

  // Accept secret from multiple sources to avoid client/tooling quirks
  let providedSecret =
    req.headers.get("x-admin-secret") ||
    req.headers.get("X-Admin-Secret") ||
    (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null)

  if (!providedSecret) {
    try {
      const body = await req.json()
      providedSecret = (body?.secret || body?.SYNC_SECRET || null) as string | null
    } catch {}
  }

  if (!providedSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized: missing secret" }, { status: 401 })
  }
  if (providedSecret !== syncSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized: invalid secret" }, { status: 401 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Categories
    const { data: existingCategories, error: categoriesFetchError } = await supabase
      .from("categories")
      .select("*")

    if (categoriesFetchError) throw categoriesFetchError

    const existingNames = new Set((existingCategories ?? []).map((c: any) => c.name))
    const newCategories = CATEGORIES.filter((c) => !existingNames.has(c.name))

    let categoriesInserted = 0
    if (newCategories.length) {
      const { error: catInsertError } = await supabase.from("categories").insert(newCategories)
      if (catInsertError) throw catInsertError
      categoriesInserted = newCategories.length
    }

    const { data: categories, error: categoriesRefetchError } = await supabase.from("categories").select("*")
    if (categoriesRefetchError) throw categoriesRefetchError
    const catList = categories ?? []

    // Products
    const { data: existingProducts, error: productsFetchError } = await supabase.from("products").select("sku")
    if (productsFetchError) throw productsFetchError

    const existingSkus = new Set((existingProducts ?? []).map((p: any) => p.sku))

    const productsToInsert = ALL_PRODUCTS.filter((p) => !existingSkus.has(p.sku)).map((p, i) => ({
      ...p,
      category_id: catList[i % Math.max(catList.length, 1)].id,
    }))

    let productsInserted = 0
    if (productsToInsert.length) {
      const { error: prodInsertError } = await supabase.from("products").insert(productsToInsert)
      if (prodInsertError) throw prodInsertError
      productsInserted = productsToInsert.length
    }

    return NextResponse.json({
      ok: true,
      categoriesInserted,
      productsInserted,
      categoriesTotal: catList.length,
      productsSkipped: ALL_PRODUCTS.length - productsInserted,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
