import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const protectedPrefixes = [
    "/account",
    "/admin",
    "/protected",
    // Removed /cart, /checkout, /wishlist - now support guest users
    "/orders",
  ]

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p))

  if (!user && isProtected && !request.nextUrl.pathname.startsWith("/auth")) {
    // no user: redirect to login with no-store to prevent back navigation showing cached content
    const url = request.nextUrl.clone()
    const redirectTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
    url.pathname = "/auth/login"
    url.search = `redirect=${redirectTo}`
    const resp = NextResponse.redirect(url)
    resp.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    resp.headers.set("Pragma", "no-cache")
    resp.headers.set("Expires", "0")
    return resp
  }

  // For protected routes, always prevent caching (even when logged in) so back after logout doesn't show stale content
  if (isProtected) {
    supabaseResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    supabaseResponse.headers.set("Pragma", "no-cache")
    supabaseResponse.headers.set("Expires", "0")
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
