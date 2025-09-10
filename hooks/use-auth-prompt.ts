"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"

const SHOW_DELAY = 3000 // 3 seconds delay before showing

export function useAuthPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const { user, loading } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on auth pages
    const isAuthPage = pathname?.startsWith('/auth/')
    
    // Don't show if user is authenticated, still loading, on auth pages, or already checked
    if (user || loading || isAuthPage || hasChecked) {
      return
    }

    // Show dialog after a delay for anonymous users
    const timer = setTimeout(() => {
      // Double check conditions before showing
      if (!user && !loading && !isAuthPage) {
        setIsOpen(true)
      }
      setHasChecked(true)
    }, SHOW_DELAY)

    return () => clearTimeout(timer)
  }, [user, loading, pathname, hasChecked])

  const dismissDialog = () => {
    setIsOpen(false)
  }

  const showDialog = () => {
    // Allow manually showing the dialog (useful for testing)
    if (!user) {
      setIsOpen(true)
    }
  }

  return {
    isOpen,
    dismissDialog,
    showDialog,
    shouldShow: !user && !loading && hasChecked
  }
}
