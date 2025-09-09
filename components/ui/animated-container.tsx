"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  animation?: "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "stagger"
  delay?: number
  duration?: number
  once?: boolean
}

export function AnimatedContainer({
  children,
  className,
  animation = "fade",
  delay = 0,
  duration = 600,
  once = true,
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, delay)
        } else if (!once && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [delay, once, hasAnimated])

  const getAnimationClasses = () => {
    const baseClasses = "transition-all ease-out"
    const durationClass = `duration-${duration}`
    
    if (!isVisible) {
      switch (animation) {
        case "slideUp":
          return `${baseClasses} ${durationClass} opacity-0 translate-y-8`
        case "slideDown":
          return `${baseClasses} ${durationClass} opacity-0 -translate-y-8`
        case "slideLeft":
          return `${baseClasses} ${durationClass} opacity-0 translate-x-8`
        case "slideRight":
          return `${baseClasses} ${durationClass} opacity-0 -translate-x-8`
        case "scale":
          return `${baseClasses} ${durationClass} opacity-0 scale-95`
        case "fade":
        default:
          return `${baseClasses} ${durationClass} opacity-0`
      }
    } else {
      return `${baseClasses} ${durationClass} opacity-100 translate-y-0 translate-x-0 scale-100`
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn(getAnimationClasses(), className)}
    >
      {children}
    </div>
  )
}
