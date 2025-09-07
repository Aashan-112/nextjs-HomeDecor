"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const [supabaseError, setSupabaseError] = useState(false)

  useEffect(() => {
    let supabase: any

    try {
      supabase = createClient()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setSupabaseError(true)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    if (supabaseError) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching profile:", error)
        setProfile(null)
      } else if (data) {
        setProfile(data)
      } else {
        // Create a default profile if none exists
        try {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const { data: newProfile, error: createError } = await supabase.from("profiles").insert({
              id: userId,
              role: "customer",
              email: userData.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }).select("*").single()

            if (createError) {
              console.error("Error creating profile:", createError)
              setProfile(null)
            } else {
              setProfile(newProfile)
            }
          } else {
            setProfile(null)
          }
        } catch (createError) {
          console.error("Error creating profile:", createError)
          setProfile(null)
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user && !supabaseError) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    if (supabaseError) {
      throw new Error("Supabase not configured")
    }

    // Set loading state to provide feedback
    setLoading(true)

    try {
      // Update last_seen in profile before signing out
      if (user) {
        try {
          const supabase = createClient()
          await supabase.from("profiles").update({
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq("id", user.id)
        } catch (profileError) {
          // Non-fatal error
          console.warn("Failed to update last_seen:", profileError)
        }
      }

      const supabase = createClient()
      // End all active refresh tokens for the current user (global sign-out)
      const { error } = await supabase.auth.signOut({ scope: "global" as any })
      if (error) {
        console.error("Error signing out:", error)
        throw error
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    } finally {
      // Clear local state and redirect to login immediately with history replace
      setUser(null)
      setProfile(null)
      setLoading(false)
      if (typeof window !== 'undefined') {
        // Replace so user cannot go back into an authenticated page
        window.location.replace('/auth/login')
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
