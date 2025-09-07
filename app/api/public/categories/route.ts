import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (error) throw error
    // Normalize image URLs to Supabase Storage public URLs
    const BASE = `${supabaseUrl}/storage/v1/object/public/site-assets/`
    const nameMap: Record<string, string> = {
      mirrors: "decorative-mirrors.png",
      furniture: "handcrafted-furniture.png",
      lighting: "artisan-lighting.png",
      decor: "home-decor-accessories.png",
      textiles: "handwoven-textiles.png",
      "artificial flowers": "flowers.jpg",
    }

    const transformed = (data || []).map((c: any) => {
      let url: string = c.image_url || ""
      // If placeholder or missing, use mapping by category name
      if (!url || url.includes("placeholder.svg")) {
        const key = String(c.name || "").toLowerCase()
        const file = nameMap[key]
        if (file) url = BASE + file
      }
      // If it's a local path, convert to storage URL
      if (url && !/^https?:\/\//i.test(url)) {
        url = BASE + url.replace(/^\//, "")
      }
      return { ...c, image_url: url }
    })

    return NextResponse.json(transformed)
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
