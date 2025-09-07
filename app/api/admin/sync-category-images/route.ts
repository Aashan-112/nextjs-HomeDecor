import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const syncSecret = process.env.SYNC_SECRET
  const bucket = "site-assets"

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })
  }
  if (!syncSecret) {
    return NextResponse.json({ ok: false, error: "SYNC_SECRET missing" }, { status: 500 })
  }

  // Accept secret via header, bearer, or JSON body
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
  if (!providedSecret) return NextResponse.json({ ok: false, error: "Unauthorized: missing secret" }, { status: 401 })
  if (providedSecret !== syncSecret) return NextResponse.json({ ok: false, error: "Unauthorized: invalid secret" }, { status: 401 })

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // List root of bucket (user mentioned all files are together)
  const { data: list, error: listErr } = await supabase.storage.from(bucket).list("", { limit: 1000 })
  if (listErr) return NextResponse.json({ ok: false, error: `List bucket failed: ${listErr.message}` }, { status: 500 })

  // Build filename maps
  const files = (list || []).filter((f: any) => !f.name.endsWith("/"))
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]) as Set<string>
  const byName = new Map<string, string>() // filename (lower) -> public URL
  const byBase = new Map<string, string>() // base (no ext, lower) -> public URL (first seen)

  for (const f of files) {
    const name: string = f.name
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : ""
    if (!allowed.has(ext)) continue
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(name)
    const url = pub.publicUrl
    byName.set(name.toLowerCase(), url)
    const base = name.slice(0, name.length - ext.length).toLowerCase()
    if (!byBase.has(base)) byBase.set(base, url)
  }

  const { data: categories, error: catErr } = await supabase.from("categories").select("id, name, image_url")
  if (catErr) return NextResponse.json({ ok: false, error: `Fetch categories failed: ${catErr.message}` }, { status: 500 })

  let updates = 0
  const tried: Array<{ id: string; name: string; chosen?: string }> = []

  for (const c of categories || []) {
    const name: string = c.name || ""
    const slug = slugifyName(name)
    // Check candidates by extension
    const candidates = [".png", ".jpg", ".jpeg", ".webp", ".svg"].map((ext) => `${slug}${ext}`)
    let foundUrl: string | undefined

    for (const cand of candidates) {
      const url = byName.get(cand.toLowerCase())
      if (url) { foundUrl = url; break }
    }
    // Fallback: lookup by base (handles files with extra suffixes)
    if (!foundUrl) {
      const baseUrl = byBase.get(slug)
      if (baseUrl) foundUrl = baseUrl
    }

    tried.push({ id: c.id, name, chosen: foundUrl })

    if (foundUrl && c.image_url !== foundUrl) {
      const { error: upErr } = await supabase.from("categories").update({ image_url: foundUrl }).eq("id", c.id)
      if (!upErr) updates++
    }
  }

  return NextResponse.json({ ok: true, updates, checked: (categories || []).length })
}
