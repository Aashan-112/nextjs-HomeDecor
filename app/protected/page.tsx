import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ProtectedPage() {
  const supabase = await createClient()

  if (!supabase) {
    console.error("Supabase client not available")
    return redirect("/auth/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return redirect("/auth/login")
    }

    return (
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="w-full">
          <div className="py-6 font-bold bg-purple-950 text-center">
            This is a protected page that you can only see as an authenticated user
          </div>
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
              <div />
              <div>Hey, {user.email}!</div>
            </div>
          </nav>
        </div>

        <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
          <main className="flex-1 flex flex-col gap-6">
            <h2 className="font-bold text-4xl mb-4">Next steps</h2>
            You can now access protected content! Consider redirecting to your account dashboard or main app content.
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Authentication error:", error)
    return redirect("/auth/login")
  }
}
