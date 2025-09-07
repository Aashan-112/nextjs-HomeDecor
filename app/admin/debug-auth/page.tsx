"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDebugPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const supabase = createClient()
      
      console.log("🔍 [DEBUG] Checking auth state...")
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log("📊 [DEBUG] Session:", session)
      console.log("❌ [DEBUG] Session Error:", sessionError)
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("👤 [DEBUG] User:", user)
      console.log("❌ [DEBUG] User Error:", userError)
      
      setAuthState({
        session,
        sessionError,
        user,
        userError
      })

      // Get profile if user exists
      if (user) {
        console.log("🔍 [DEBUG] Fetching profile for user:", user.id)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()
        
        console.log("👤 [DEBUG] Profile data:", profileData)
        console.log("❌ [DEBUG] Profile error:", profileError)
        
        setProfile({ data: profileData, error: profileError })
      }
      
    } catch (err) {
      console.error("🚨 [DEBUG] Error checking auth state:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createAdminProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("No user logged in")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating admin profile:", error)
        alert(`Error: ${error.message}`)
      } else {
        console.log("Admin profile created:", data)
        alert("Admin profile created successfully!")
        await checkAuthState() // Refresh the data
      }
    } catch (err) {
      console.error("Error creating admin profile:", err)
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div>Loading auth debug info...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Admin Authentication Debug</CardTitle>
          <CardDescription>
            This page helps debug authentication issues. Check the console for detailed logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={checkAuthState} variant="outline">
            🔄 Refresh Auth State
          </Button>
          
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          {authState?.session ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">Active Session</Badge>
              </div>
              <div><strong>Access Token:</strong> {authState.session.access_token ? '✅ Present' : '❌ Missing'}</div>
              <div><strong>Refresh Token:</strong> {authState.session.refresh_token ? '✅ Present' : '❌ Missing'}</div>
              <div><strong>Expires At:</strong> {authState.session.expires_at ? new Date(authState.session.expires_at * 1000).toLocaleString() : 'Unknown'}</div>
            </div>
          ) : (
            <div className="text-red-600">
              <Badge variant="destructive">No Session</Badge>
              {authState?.sessionError && <p className="mt-2">Error: {authState.sessionError.message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>👤 User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {authState?.user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">User Found</Badge>
              </div>
              <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{authState.user.id}</code></div>
              <div><strong>Email:</strong> {authState.user.email}</div>
              <div><strong>Email Confirmed:</strong> {authState.user.email_confirmed_at ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Created:</strong> {new Date(authState.user.created_at).toLocaleString()}</div>
              <div><strong>Last Sign In:</strong> {authState.user.last_sign_in_at ? new Date(authState.user.last_sign_in_at).toLocaleString() : 'Never'}</div>
            </div>
          ) : (
            <div className="text-red-600">
              <Badge variant="destructive">No User</Badge>
              {authState?.userError && <p className="mt-2">Error: {authState.userError.message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>🏷️ Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.data ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={profile.data.role === 'admin' ? 'default' : 'secondary'}>
                  Role: {profile.data.role}
                </Badge>
              </div>
              <div><strong>Email:</strong> {profile.data.email}</div>
              <div><strong>Created:</strong> {new Date(profile.data.created_at).toLocaleString()}</div>
              <div><strong>Updated:</strong> {new Date(profile.data.updated_at).toLocaleString()}</div>
              {profile.data.last_seen && (
                <div><strong>Last Seen:</strong> {new Date(profile.data.last_seen).toLocaleString()}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-red-600">
                <Badge variant="destructive">No Profile Found</Badge>
                {profile?.error && <p className="mt-2">Error: {profile.error.message}</p>}
              </div>
              {authState?.user && (
                <Button onClick={createAdminProfile} className="bg-blue-600 hover:bg-blue-700">
                  🛠️ Create Admin Profile
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>If you see "No User":</strong>
            <ul className="list-disc pl-6 mt-1">
              <li>Go to <a href="/auth/login" className="text-blue-600 hover:underline">/auth/login</a> and sign in</li>
              <li>Or create an account at <a href="/auth/sign-up" className="text-blue-600 hover:underline">/auth/sign-up</a></li>
            </ul>
          </div>
          
          <div>
            <strong>If you have a user but no profile:</strong>
            <ul className="list-disc pl-6 mt-1">
              <li>Click "Create Admin Profile" button above</li>
              <li>Or run the SQL script in your Supabase dashboard</li>
            </ul>
          </div>
          
          <div>
            <strong>If you have a profile but role is not 'admin':</strong>
            <ul className="list-disc pl-6 mt-1">
              <li>Run this SQL in your Supabase dashboard:</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">UPDATE profiles SET role = 'admin' WHERE email = 'your-email@domain.com'</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
