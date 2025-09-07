import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (error) {
      // If no row found, return 404 to indicate product not found
      if ((error as any).code === "PGRST116" || /No rows|not found/i.test(String(error.message))) {
        return NextResponse.json({ ok: false, error: "Not Found" }, { status: 404 })
      }
      throw error
    }

    const BASE = `${supabaseUrl}/storage/v1/object/public/site-assets/`
    const PLACEHOLDER = `${BASE}placeholder.jpg`

    const skuMap: Record<string, string> = {
      'RWM-001': 'rustic-wooden-mirror.png',
      'VBM-002': 'vintage-brass-mirror.png',
      'HRC-003': 'handwoven-rattan-chair.png',
      'CTL-004': 'ceramic-table-lamp.png',
      'MWH-005': 'macrame-wall-hanging.png',
      'WCT-006': 'live-edge-coffee-table.png',
      'PLF-007': 'woven-pendant-light.png',
      'CVS-008': 'ceramic-vase-set.png',
      'WSB-009': 'woven-storage-basket.png',
      'CWS-010': 'copper-wall-sconce.png',
      'ETP-011': 'embroidered-throw-pillow.png',
      'RWS-012': 'reclaimed-wood-shelf.png',
    }

    const p: any = data
    const images: string[] = Array.isArray(p.images) ? p.images : []
    let newImages = images.map((v) => {
      let url = String(v || "")
      if (!url || url.includes("placeholder.svg")) return PLACEHOLDER
      if (!/^https?:\/\//i.test(url)) return BASE + url.replace(/^\//, "")
      return url
    })

    if (newImages.length === 0 || newImages.every((u) => !u || u === PLACEHOLDER)) {
      const file = skuMap[String(p.sku)]
      if (file) {
        newImages = [`${BASE}${file}`]
      } else if (newImages.length === 0) {
        newImages = [PLACEHOLDER]
      }
    }

    const transformed = {
      ...p,
      images: newImages,
      price: typeof p?.price === "string" ? parseFloat(p.price) : p.price,
      compare_at_price:
        p?.compare_at_price == null
          ? undefined
          : typeof p.compare_at_price === "string"
          ? parseFloat(p.compare_at_price)
          : p.compare_at_price,
      weight:
        p?.weight == null
          ? undefined
          : typeof p.weight === "string"
          ? parseFloat(p.weight)
          : p.weight,
    }

    return NextResponse.json(transformed)
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
