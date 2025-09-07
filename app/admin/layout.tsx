import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  // Require session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirect=/admin")
  }

  // Check role from profiles
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") {
    redirect("/")
  }

  return <>{children}</>
}
