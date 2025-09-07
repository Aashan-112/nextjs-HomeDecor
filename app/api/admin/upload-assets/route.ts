import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

function getContentType(file: string): string {
  const ext = path.extname(file).toLowerCase()
  switch (ext) {
    case ".png":
      return "image/png"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".webp":
      return "image/webp"
    case ".svg":
      return "image/svg+xml"
    default:
      return "application/octet-stream"
  }
}

function isImageFile(name: string): boolean {
  return /\.(png|jpg|jpeg|webp|svg)$/i.test(name)
}

export async function POST(req: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = "site-assets"

  if (!syncSecret) {
    return NextResponse.json({ ok: false, error: "Missing SYNC_SECRET in environment" }, { status: 500 })
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })
  }

  // Validate secret (header, bearer, or body)
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
  if (providedSecret !== syncSecret)
    return NextResponse.json({ ok: false, error: "Unauthorized: invalid secret" }, { status: 401 })

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Ensure bucket exists and is public
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = (buckets || []).some((b: any) => b.name === bucket)
    if (!exists) {
      await supabase.storage.createBucket(bucket, { public: true })
    } else {
      await supabase.storage.updateBucket(bucket, { public: true })
    }

    // Read local public directory
    const publicDir = path.join(process.cwd(), "public")
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ ok: false, error: `Public directory not found at ${publicDir}` }, { status: 500 })
    }

    const files = fs.readdirSync(publicDir).filter((f) => isImageFile(f))

    const uploaded: { file: string; path: string; publicUrl: string }[] = []
    const failed: { file: string; error: string }[] = []

    for (const file of files) {
      try {
        const filepath = path.join(publicDir, file)
        const content = fs.readFileSync(filepath)
        const contentType = getContentType(file)
        // Upload at root of bucket with same filename
        const remotePath = file
        // upsert to avoid conflicts on re-run
        await supabase.storage.from(bucket).upload(remotePath, content, {
          contentType,
          upsert: true as any,
        } as any)
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(remotePath)
        uploaded.push({ file, path: remotePath, publicUrl: pub.publicUrl })
      } catch (err: any) {
        failed.push({ file, error: err?.message ?? String(err) })
      }
    }

    // Build filename -> publicUrl map
    const urlMap = new Map(uploaded.map((u) => [u.file, u.publicUrl]))

    // Update categories.image_url if it refers to local assets
    const { data: categories } = await supabase.from("categories").select("id, image_url")
    let categoriesUpdated = 0
    if (categories) {
      for (const cat of categories) {
        const imageUrl: string | null = cat.image_url || null
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          const base = path.basename(imageUrl.replace(/^\//, ""))
          const publicUrl = urlMap.get(base)
          if (publicUrl) {
            await supabase.from("categories").update({ image_url: publicUrl }).eq("id", cat.id)
            categoriesUpdated++
          }
        }
      }
    }

    // Update products.images[] entries that refer to local assets
    const { data: products } = await supabase.from("products").select("id, images")
    let productsUpdated = 0
    if (products) {
      for (const prod of products) {
        const images: string[] = Array.isArray(prod.images) ? prod.images : []
        let changed = false
        const newImages = images.map((img) => {
          if (!img || /^https?:\/\//i.test(img)) return img
          const base = path.basename((img as string).replace(/^\//, ""))
          const publicUrl = urlMap.get(base)
          if (publicUrl) {
            changed = true
            return publicUrl
          }
          return img
        })
        if (changed) {
          await supabase.from("products").update({ images: newImages }).eq("id", prod.id)
          productsUpdated++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      bucket,
      uploadedCount: uploaded.length,
      failedCount: failed.length,
      categoriesUpdated,
      productsUpdated,
      failed,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
