"use client"

import { cn } from "@/lib/utils"

interface PromoBannerProps {
  className?: string
  speed?: number
  pauseOnHover?: boolean
}

const promoMessages = [
  "FLASH SALE: 25% OFF All Furniture - Limited Time Only",
  "FREE SHIPPING on orders over PKR 7500 - No code needed",
  "END OF SEASON SALE: Up to 40% OFF Selected Items",
  "NEW ARRIVALS: Spring Collection Now Available",
  "FLAT 15% DISCOUNT on All Mirrors - Use code MIRROR15",
  "Buy 2 Get 1 FREE on Home Decor Items",
  "WEEKEND SPECIAL: Extra 10% OFF Already Reduced Prices",
  "HANDCRAFTED QUALITY - Each piece is unique and made with love",
  "CLEARANCE SALE: Up to 50% OFF Last Season Items",
  "GIFT WRAPPING available on all orders - Make it special"
]

export function PromoBanner({ 
  className, 
  speed = 15, 
  pauseOnHover = true 
}: PromoBannerProps) {
  const duplicatedMessages = [...promoMessages, ...promoMessages]
  
  return (
    <div
      className={cn(
        "sticky top-16 z-40 overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600",
        "text-white shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div 
        className={cn(
          "flex items-center py-2.5 whitespace-nowrap",
          "animate-[scroll_30s_linear_infinite]",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          transform: 'translateX(0)',
          animation: `scroll ${speed}s linear infinite`
        }}
      >
        {duplicatedMessages.map((message, index) => (
          <div
            key={`${message}-${index}`}
            className="flex items-center px-4"
          >
            <span className="text-xs sm:text-sm lg:text-base font-semibold text-white">
              {message}
            </span>
            <span className="mx-6 text-white/60">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
