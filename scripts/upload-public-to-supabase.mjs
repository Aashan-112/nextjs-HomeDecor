import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function log(...args) { console.log('[upload-public-to-supabase]', ...args) }
function err(...args) { console.error('[upload-public-to-supabase]', ...args) }

async function readEnvLocal(projectRoot) {
  const envPath = path.join(projectRoot, '.env.local')
  const env = {}
  try {
    const raw = await fsp.readFile(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
      if (!m) continue
      let [, k, v] = m
      v = v.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
      env[k] = v
    }
  } catch (e) {
    err('Failed to read .env.local:', e.message)
  }
  return env
}

function contentTypeFromExt(p) {
  const ext = path.extname(p).toLowerCase()
  switch (ext) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
}

function isImageFile(p) {
  return /\.(png|jpg|jpeg|webp|svg)$/i.test(p)
}

async function walkDir(root) {
  const out = []
  async function rec(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) await rec(full)
      else out.push(full)
    }
  }
  await rec(root)
  return out
}

function toPosix(p) { return p.split(path.sep).join('/') }

async function main() {
  // Project root = two levels up (scripts/..)
  const projectRoot = path.resolve(__dirname, '..')
  const publicDir = path.join(projectRoot, 'public')

  const env = await readEnvLocal(projectRoot)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  const BUCKET = 'site-assets'

  if (!SUPABASE_URL || !SERVICE_KEY) {
    err('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Ensure bucket exists and is public
  log('Ensuring bucket exists and is public:', BUCKET)
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) { err('List buckets error:', listErr.message); process.exit(1) }
  const exists = (buckets || []).some(b => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) { err('Create bucket error:', error.message); process.exit(1) }
  } else {
    const { error } = await supabase.storage.updateBucket(BUCKET, { public: true })
    if (error) { err('Update bucket error:', error.message); process.exit(1) }
  }

  // Upload all images from /public
  if (!fs.existsSync(publicDir)) {
    err('Public directory not found:', publicDir)
    process.exit(1)
  }

  log('Scanning public directory...')
  const allFiles = await walkDir(publicDir)
  const imageFiles = allFiles.filter(f => isImageFile(f))
  if (imageFiles.length === 0) {
    err('No images found under public/. Nothing to upload.')
    process.exit(1)
  }

  const uploaded = []
  const failed = []

  for (const full of imageFiles) {
    const rel = path.relative(publicDir, full) // e.g., foo/bar.png
    const key = toPosix(rel) // keep subfolders if any
    const ct = contentTypeFromExt(full)
    try {
      const data = await fsp.readFile(full)
      const { error } = await supabase.storage.from(BUCKET).upload(key, data, { contentType: ct, upsert: true })
      if (error) throw error
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key)
      uploaded.push({ key, url: pub.publicUrl, file: full })
      log('Uploaded:', key)
    } catch (e) {
      failed.push({ key, error: e.message })
      err('Upload failed:', key, e.message)
    }
  }

  // Build lookup maps (by relative path and by basename)
  const byRel = new Map(uploaded.map(u => [u.key.toLowerCase(), u.url]))
  const byBase = new Map(uploaded.map(u => [path.basename(u.key).toLowerCase(), u.url]))

  // Update categories image_url
  log('Rewriting categories.image_url to public URLs...')
  const { data: cats, error: catErr } = await supabase.from('categories').select('id, image_url, name')
  if (catErr) { err('Fetch categories error:', catErr.message); process.exit(1) }
  let catUpdated = 0
  for (const c of cats || []) {
    let val = c.image_url || ''
    if (/^https?:\/\//i.test(val)) continue // already URL
    // normalize local path
    const norm = toPosix(val.replace(/^\//, '')).toLowerCase()
    let url = byRel.get(norm) || byBase.get(path.basename(norm))
    // as a fallback, try name-based guess (e.g., mirrors -> decorative-mirrors.png)
    if (!url) {
      const guessBase = c.name?.toLowerCase().replace(/\s+/g, '-') + '.png'
      url = byBase.get(guessBase)
    }
    if (url) {
      const { error } = await supabase.from('categories').update({ image_url: url }).eq('id', c.id)
      if (error) err('Update category failed:', c.id, error.message)
      else catUpdated++
    }
  }

  // Update products images[] entries
  log('Rewriting products.images[] to public URLs...')
  const { data: prods, error: prodErr } = await supabase.from('products').select('id, images, sku')
  if (prodErr) { err('Fetch products error:', prodErr.message); process.exit(1) }
  let prodUpdated = 0
  for (const p of prods || []) {
    const images = Array.isArray(p.images) ? p.images : []
    let changed = false
    const newImages = images.map((v) => {
      if (!v || /^https?:\/\//i.test(v)) return v
      const norm = toPosix(String(v).replace(/^\//, '')).toLowerCase()
      let url = byRel.get(norm) || byBase.get(path.basename(norm))
      if (!url) {
        // try sku-based guess
        const guess = (p.sku || '').toLowerCase().replace(/\s+/g, '-') + '.png'
        url = byBase.get(guess)
      }
      if (url) { changed = true; return url }
      return v
    })
    if (changed) {
      const { error } = await supabase.from('products').update({ images: newImages }).eq('id', p.id)
      if (error) err('Update product failed:', p.id, error.message)
      else prodUpdated++
    }
  }

  log('Done.')
  console.table({ uploaded: uploaded.length, failed: failed.length, categoriesUpdated: catUpdated, productsUpdated: prodUpdated })
  if (failed.length) {
    log('Some uploads failed:')
    console.table(failed)
  }
}

main().catch((e) => { err('Fatal:', e); process.exit(1) })
