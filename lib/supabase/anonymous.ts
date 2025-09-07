import { createClient } from "@supabase/supabase-js"

export function createAnonymousClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables, returning mock anonymous client")
    // Return a mock client for anonymous operations
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            limit: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          limit: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
