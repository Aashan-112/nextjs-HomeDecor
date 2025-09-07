"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ExternalImageProps {
  src?: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallbackSrc?: string
}

export function ExternalImage({ 
  src, 
  alt, 
  className,
  width,
  height,
  fallbackSrc = "/placeholder.jpg?height=400&width=400"
}: ExternalImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc)

  useEffect(() => {
    if (src) {
      setImageSrc(src)
      setImageError(false)
      setIsLoading(true)
    }
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    console.warn(`Failed to load external image: ${src}`)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setImageError(true)
      setIsLoading(true) // Reset loading for fallback image
    } else {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-200 w-full h-full",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {imageError && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          External image failed
        </div>
      )}
    </div>
  )
}
