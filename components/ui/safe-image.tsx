"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  fallbackSrc?: string
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  fill = false,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  fallbackSrc = "/placeholder.jpg?height=400&width=400"
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use fallback if no src or if there was an error
  const imageSrc = (!src || imageError) ? fallbackSrc : src

  // Check if the URL is from a configured domain
  const isExternalImage = src && !src.startsWith('/') && !src.includes('supabase.co')

  if (isExternalImage) {
    // For external images, use regular img tag to avoid Next.js restrictions
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "object-cover transition-opacity duration-200",
            fill ? "absolute inset-0 w-full h-full" : "",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          width={width}
          height={height}
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            console.warn(`Failed to load image: ${src}`)
            if (src !== fallbackSrc) {
              setImageError(true)
              setIsLoading(false)
            }
          }}
        />
      </div>
    )
  }

  // For internal/configured images, use Next.js Image component
  return (
    <>
      {isLoading && (
        <div className={cn(
          "bg-gray-200 animate-pulse flex items-center justify-center",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        placeholder={placeholder}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.warn(`Failed to load image: ${src}`)
          if (src !== fallbackSrc) {
            setImageError(true)
          }
        }}
      />
    </>
  )
}
