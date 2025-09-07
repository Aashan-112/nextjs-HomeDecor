"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Helper: timeout for Promise-like values (Supabase builders are Thenables)
    const withTimeout = <T,>(p: PromiseLike<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("Login timed out. Check your network and Supabase config.")), ms)
        Promise.resolve(p)
          .then((v) => {
            clearTimeout(t)
            resolve(v)
          })
          .catch((e) => {
            clearTimeout(t)
            reject(e)
          })
      })

    try {
      // Add loading indicator feedback
      const loginStartTime = Date.now()
      
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
      )

      if (error) throw error

      // Ensure session is established before navigating
      const {
        data: { session },
      } = await withTimeout(supabase.auth.getSession(), 5000)

      if (!session) {
        throw new Error("Login succeeded but no session was established. Please try again.")
      }

      // Determine role from profile only
      let effectiveRole: "admin" | "customer" = "customer"
      try {
        const { data: profile } = await withTimeout(
          supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle(),
          5000,
        )
        
        if (!profile) {
          // Create profile if it doesn't exist
          await withTimeout(
            supabase.from("profiles").insert({
              id: session.user.id,
              role: "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }),
            5000
          )
        } else if (profile?.role === "admin") {
          effectiveRole = "admin"
        }
      } catch (profileError) {
        // Non-fatal: default to 'customer' if role retrieval fails
        console.warn("Profile retrieval error:", profileError)
      }

      // Ensure minimum loading time for better UX
      const loadingTime = Date.now() - loginStartTime
      if (loadingTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - loadingTime))
      }

      const target =
        effectiveRole === "admin"
          ? "/admin"
          : redirectTo && redirectTo.startsWith("/")
            ? redirectTo
            : "/"

      // Full page navigation so middleware reads the new cookies immediately
      window.location.assign(target)
      return
    } catch (error: unknown) {
      console.error("Login error:", error)
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during login. Verify your credentials and try again."
      setError(message)
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
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/auth/sign-up${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                    className="underline underline-offset-4"
                  >
                    Sign up
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