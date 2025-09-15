"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 animate-fadeIn">
      <div className="relative">
        {/* Image skeleton */}
        <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted animate-shimmer" />
        
        {/* Badge skeletons */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        
        {/* Wishlist button skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-3/4" />
          
          {/* Price skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          {/* Materials skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}

export function TestimonialSkeleton() {
  return (
    <Card className="border-border/50 animate-fadeIn">
      <CardContent className="p-6">
        {/* Quote icon skeleton */}
        <Skeleton className="h-8 w-8 mb-4" />
        
        {/* Review text skeleton */}
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Product info skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Customer info skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CategoryCardSkeleton() {
  return (
    <Card className="group overflow-hidden border-border/50 animate-fadeIn">
      <div className="relative">
        {/* Image skeleton */}
        <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted animate-shimmer" />
        
        {/* Overlay skeleton */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Content skeleton */}
        <div className="absolute bottom-6 left-6 right-6">
          <Skeleton className="h-6 w-3/4 mb-2 bg-white/20" />
          <Skeleton className="h-4 w-1/2 bg-white/10" />
        </div>
      </div>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="border-border/50 animate-fadeIn">
      <CardContent className="p-6 text-center">
        {/* Icon skeleton */}
        <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
        
        {/* Number skeleton */}
        <Skeleton className="h-10 w-16 mx-auto mb-2" />
        
        {/* Title skeleton */}
        <Skeleton className="h-5 w-24 mx-auto mb-1" />
        
        {/* Description skeleton */}
        <Skeleton className="h-4 w-32 mx-auto" />
      </CardContent>
    </Card>
  )
}

// Enhanced micro-interactions
export function MicroButton({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}: {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary"
  className?: string
  [key: string]: any
}) {
  const baseClass = "relative overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
  
  const variants = {
    default: "bg-background hover:bg-muted border border-border hover:border-accent/30",
    primary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground",
    secondary: "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground"
  }
  
  return (
    <button 
      className={cn(baseClass, variants[variant], className)}
      {...props}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
      
      {/* Ripple effect container */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="absolute inset-0 rounded-inherit animate-pulse bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
      </span>
    </button>
  )
}

export function FloatingOrb({ 
  size = "sm", 
  color = "accent",
  className = "",
  delay = 0 
}: {
  size?: "xs" | "sm" | "md" | "lg"
  color?: "accent" | "primary" | "secondary"
  className?: string
  delay?: number
}) {
  const sizes = {
    xs: "w-2 h-2",
    sm: "w-4 h-4", 
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }
  
  const colors = {
    accent: "bg-accent/30",
    primary: "bg-primary/30", 
    secondary: "bg-secondary/30"
  }
  
  return (
    <div 
      className={cn(
        "absolute rounded-full blur-sm animate-float",
        sizes[size],
        colors[color],
        className
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${4 + delay}s`
      }}
    />
  )
}

// Loading states for different sections
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TestimonialGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TestimonialSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      {/* Header skeleton */}
      <div className="h-16 bg-muted/20 border-b border-border/20" />
      
      {/* Hero skeleton */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-24" />
              </div>
            </div>
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    </div>
  )
}
