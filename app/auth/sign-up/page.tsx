"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/"

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    // Add loading indicator feedback
    const signupStartTime = Date.now()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // Create or update profile with role. First ever user becomes admin.
      try {
        // Check if any admin exists
        const { data: admins, error: adminError } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1)
        
        if (adminError) {
          console.warn('Error checking for admin users:', adminError)
        }
        
        const role = (admins && admins.length > 0) ? 'customer' : 'admin'

        // Insert or upsert profile for the newly registered user
        // auth.signUp may not return user immediately if email confirmation is enabled.
        // We create a pending profile with email as identifier when user id is not available yet.
        const userId = data.user?.id || null
        if (userId) {
          const { error: profileError } = await supabase.from('profiles').upsert({ 
            id: userId, 
            role, 
            email: email, // Store email for easier identification
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          }, { onConflict: 'id' as any })
          
          if (profileError) {
            console.error('Error creating user profile:', profileError)
          }
        }
      } catch (e) {
        console.warn('Profile role setup error:', e)
      }

      // Ensure minimum loading time for better UX
      const loadingTime = Date.now() - signupStartTime
      if (loadingTime < 800) {
        await new Promise(resolve => setTimeout(resolve, 800 - loadingTime))
      }

      router.push(`/auth/sign-up-success?redirect=${encodeURIComponent(redirectTo)}`)
    } catch (error: unknown) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password">Repeat Password</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating an account..." : "Sign up"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href={`/auth/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
