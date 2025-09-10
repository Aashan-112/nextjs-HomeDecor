"use client"

import { Children, cloneElement, ReactElement, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
  animation?: "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale"
  duration?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  initialDelay = 0,
  animation = "slideUp",
  duration = 600,
  once = true,
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, initialDelay)
        } else if (!once && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [initialDelay, once, hasAnimated])

  const getAnimationClasses = (index: number) => {
    const baseClasses = "transition-all ease-out"
    const durationClass = `duration-${duration}`
    const delay = `delay-[${index * staggerDelay}ms]`
    
    if (!isVisible) {
      switch (animation) {
        case "slideUp":
          return `${baseClasses} ${durationClass} ${delay} opacity-0 translate-y-8`
        case "slideDown":
          return `${baseClasses} ${durationClass} ${delay} opacity-0 -translate-y-8`
        case "slideLeft":
          return `${baseClasses} ${durationClass} ${delay} opacity-0 translate-x-8`
        case "slideRight":
          return `${baseClasses} ${durationClass} ${delay} opacity-0 -translate-x-8`
        case "scale":
          return `${baseClasses} ${durationClass} ${delay} opacity-0 scale-95`
        case "fade":
        default:
          return `${baseClasses} ${durationClass} ${delay} opacity-0`
      }
    } else {
      return `${baseClasses} ${durationClass} ${delay} opacity-100 translate-y-0 translate-x-0 scale-100`
    }
  }

  return (
    <div ref={containerRef} className={cn(className)}>
      {Children.map(children, (child, index) => {
        if (typeof child === 'object' && child && 'type' in child) {
          return (
            <div key={index} className={getAnimationClasses(index)}>
              {child}
            </div>
          )
        }
        return child
      })}
    </div>
  )
}
