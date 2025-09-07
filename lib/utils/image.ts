export function getImageSrc(input?: string | null): string {
  // Prefer a reliable local placeholder
  const fallback = "/placeholder.jpg"
  if (!input || typeof input !== "string") return fallback

  const src = input.trim()
  if (!src) return fallback

  // If remote URL (e.g., Supabase Storage), return as-is
  if (/^https?:\/\//i.test(src)) return src

  // If already an absolute public path
  if (src.startsWith("/")) return src

  // Otherwise, treat as a relative public path under /public
  return `/${src}`
}
