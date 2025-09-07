import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 }
    )
  }

  // Verify the current user is authenticated and has admin role
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check if user has admin role
  const { data: profile } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Admin access required" },
      { status: 403 }
    )
  }

  // Use service role to bypass RLS and get specific product
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { ok: false, error: "Product not found" },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
