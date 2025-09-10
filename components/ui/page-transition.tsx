"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isLoaded 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// Loading component for better UX
export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

// Enhanced loading skeleton for products
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="space-y-4 animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="aspect-[4/3] bg-muted rounded-lg animate-shimmer"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-shimmer"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-shimmer"></div>
            <div className="h-10 bg-muted rounded animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
