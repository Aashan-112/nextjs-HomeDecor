import { createClient } from "@/lib/supabase/server"

export async function checkAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { isAdmin: false, user: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    return { isAdmin: false, user }
  }

  return { isAdmin: true, user }
}

export async function requireAdmin() {
  const { isAdmin } = await checkAdminAccess()

  if (!isAdmin) {
    throw new Error("Admin access required")
  }
}
