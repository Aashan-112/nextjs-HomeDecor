"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminAuthCheckProps {
  children: React.ReactNode
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      
      try {
        setDebugInfo("Checking authentication...")
        console.log("🔐 Checking admin authentication...")
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("❌ Auth error:", authError)
          setError(`Auth error: ${authError.message}`)
          setDebugInfo("Auth error occurred")
          router.replace('/auth/login?redirect=/admin')
          return
        }
        
        if (!user) {
          console.log("👤 No user found, redirecting to login")
          setDebugInfo("No user found")
          router.replace('/auth/login?redirect=/admin')
          return
        }
        
        setDebugInfo(`User found: ${user.email}`)
        console.log("👤 User found:", user.email)
        
        // Check admin role
        setDebugInfo("Checking admin role...")
        console.log("🔍 Checking admin role...")
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle()
        
        if (profileError) {
          console.error("❌ Profile error:", profileError)
          setError(`Profile error: ${profileError.message}`)
          setDebugInfo("Profile error occurred")
          return
        }
        
        console.log("👤 Profile data:", profile)
        setDebugInfo(`Profile: ${profile?.first_name} ${profile?.last_name} (${profile?.role})`)
        
        if (profile?.role !== 'admin') {
          console.log("🚫 User is not admin, redirecting")
          setDebugInfo("User is not admin")
          setError("Admin access required")
          router.replace('/')
          return
        }
        
        console.log("✅ Admin access confirmed")
        setDebugInfo("Admin access confirmed")
        setIsAdmin(true)
        
      } catch (err: any) {
        console.error("💥 Auth check error:", err)
        setError(err.message)
        setDebugInfo(`Error: ${err.message}`)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Checking Access...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-center">{debugInfo}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-red-700">
                {error || "Admin access required"}
              </p>
              <p className="text-sm text-red-600">Debug: {debugInfo}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
