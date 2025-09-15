"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ShoppingCart, 
  ArrowUp, 
  MessageCircle, 
  Phone, 
  Heart,
  Menu,
  ChevronUp 
} from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

interface ScrollProgressProps {
  className?: string
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentProgress = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight
      
      if (scrollHeight > 0) {
        setScrollProgress(Math.min((currentProgress / scrollHeight) * 100, 100))
      }
    }

    window.addEventListener("scroll", updateScrollProgress)
    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  return (
    <div className={cn("fixed top-0 left-0 w-full h-1 bg-accent/20 z-[60]", className)}>
      <div 
        className="h-full bg-gradient-to-r from-accent via-primary to-accent transition-all duration-300 shadow-lg"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-24 right-8 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-12 z-[50] animate-bounce"
      size="icon"
    >
      <ChevronUp className="h-4 w-4 animate-pulse" />
    </Button>
  )
}

export function FloatingCart() {
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <Link href="/cart">
      <Button
        className="fixed bottom-42 right-7 h-16 w-16 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-110 z-40 relative group"
        size="icon"
      >
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
        
        <ShoppingCart className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        
        {/* Item count badge */}
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>
    </Link>
  )
}

export function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Main action button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-110 relative group"
        size="icon"
      >
        <Menu className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-90 scale-110' : ''}`} />
      </Button>

      {/* Expanded action buttons */}
      <div className={cn(
        "absolute bottom-16 right-1 flex flex-col gap-3 transition-all duration-500 transform",
        isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Contact button */}
        <Button
          className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-12"
          size="icon"
          style={{ animationDelay: '0.1s' }}
        >
          <Phone className="h-5 w-5" />
        </Button>

        {/* Chat button */}
        <Button
          className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-12"
          size="icon"
          style={{ animationDelay: '0.2s' }}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        {/* Wishlist button */}
        <Link href="/wishlist">
          <Button
            className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-12"
            size="icon"
            style={{ animationDelay: '0.3s' }}
          >
            <Heart className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Scroll-triggered animations hook
export function useScrollAnimation(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return [setRef, isVisible] as const
}

// Animated number counter component
export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "",
  className = ""
}: { 
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [ref, isVisible] = useScrollAnimation(0.3)

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true)
      let startTime = Date.now()
      const startCount = 0

      const updateCount = () => {
        const elapsedTime = Date.now() - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        
        // Easing function for smooth animation
        const easeOutExpo = 1 - Math.pow(2, -10 * progress)
        
        setCount(Math.floor(startCount + (end - startCount) * easeOutExpo))

        if (progress < 1) {
          requestAnimationFrame(updateCount)
        }
      }

      requestAnimationFrame(updateCount)
    }
  }, [isVisible, hasAnimated, end, duration])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// All floating elements combined
export function FloatingElements() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <FloatingCart />
      <FloatingActions />
    </>
  )
}
