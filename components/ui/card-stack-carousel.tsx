"use client"

import { ReactNode, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardStackCarouselProps {
  children: ReactNode[]
  className?: string
  showNavigation?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  cardWidth?: number
  minCardHeight?: number
}

export function CardStackCarousel({ 
  children, 
  className = "", 
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  cardWidth = 320,
  minCardHeight = 400
}: CardStackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length)
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length)
  }
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }
  
  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return
    
    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval])
  
  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + children.length) % children.length
    const totalCards = Math.min(5, children.length) // Show max 5 cards in stack
    
    // Responsive offsets based on screen size
    const isMobile = cardWidth <= 280
    const baseOffset = isMobile ? 40 : 60
    const baseRotation = isMobile ? 10 : 15
    const baseZOffset = isMobile ? 15 : 20
    
    if (diff === 0) {
      // Center card (active)
      return {
        transform: `translateX(-50%) translateY(-50%) translateZ(0) rotateY(0deg) scale(1)`,
        zIndex: totalCards + 10,
        opacity: 1,
        filter: 'brightness(1)'
      }
    }
    
    // Cards to the right
    if (diff <= Math.floor(totalCards / 2)) {
      const offset = diff * baseOffset
      const rotateY = diff * baseRotation
      const scale = 1 - (diff * (isMobile ? 0.08 : 0.1))
      const brightness = 1 - (diff * 0.2)
      const blur = 0 // Remove blur effect
      
      return {
        transform: `translateX(calc(-50% + ${offset}px)) translateY(-50%) translateZ(-${diff * baseZOffset}px) rotateY(-${rotateY}deg) scale(${scale})`,
        zIndex: totalCards + 10 - diff,
        opacity: 1 - (diff * 0.2),
        filter: `brightness(${brightness})`
      }
    }
    
    // Cards to the left
    const leftDiff = children.length - diff
    if (leftDiff <= Math.floor(totalCards / 2)) {
      const offset = -leftDiff * baseOffset
      const rotateY = leftDiff * baseRotation
      const scale = 1 - (leftDiff * (isMobile ? 0.08 : 0.1))
      const brightness = 1 - (leftDiff * 0.2)
      const blur = 0 // Remove blur effect
      
      return {
        transform: `translateX(calc(-50% + ${offset}px)) translateY(-50%) translateZ(-${leftDiff * baseZOffset}px) rotateY(${rotateY}deg) scale(${scale})`,
        zIndex: totalCards + 10 - leftDiff,
        opacity: 1 - (leftDiff * 0.2),
        filter: `brightness(${brightness})`
      }
    }
    
    // Hidden cards
    return {
      transform: `translateX(-50%) translateY(-50%) translateZ(-${isMobile ? 150 : 200}px) rotateY(0deg) scale(${isMobile ? 0.7 : 0.6})`,
      zIndex: 1,
      opacity: 0,
      filter: `brightness(0.5)`
    }
  }
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Carousel Container */}
      <div 
        className="relative mx-auto overflow-visible"
        style={{
          minHeight: `${minCardHeight + (cardWidth <= 280 ? 60 : 80)}px`,
          width: '100%',
          maxWidth: `${cardWidth + (cardWidth <= 280 ? 200 : 400)}px`,
          perspective: cardWidth <= 280 ? '800px' : '1200px',
          perspectiveOrigin: 'center center'
        }}
      >
        {children.map((child, index) => {
          const diff = (index - currentIndex + children.length) % children.length; // Define diff here
          return (
            <div
              key={index}
              className="absolute left-1/2 cursor-pointer transition-all duration-700 ease-out"
              style={{
                top: '65%', // Move cards down 10% more (55% + 10% = 65%)
                width: `${cardWidth}px`,
                minHeight: `${minCardHeight}px`,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
                ...getCardStyle(index)
              }}
              onClick={() => goToSlide(index)}
            >
              <div 
                className="w-full h-full rounded-xl shadow-2xl transform-gpu"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  backgroundColor: diff === 0 ? 'var(--background)' : 'transparent',
                  border: diff === 0 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div className="w-full min-h-full overflow-hidden rounded-xl">
                  {child}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Navigation Buttons - Centered relative to carousel cards */}
      {showNavigation && (
        <>
          <div 
            className="absolute z-50"
            style={{
              left: '-20px', // Equal spacing from container edge
              top: `${(cardWidth <= 280 ? 90 : 80)}px`,
              height: `${minCardHeight}px`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Button
              variant="outline"
              size="icon"
              className={`${cardWidth <= 280 ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-white dark:bg-gray-800 border-2 shadow-xl hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transition-all duration-200`}
              onClick={prevSlide}
            >
              <ChevronLeft className={cardWidth <= 280 ? 'h-5 w-5' : 'h-6 w-6'} />
            </Button>
          </div>
          
          <div 
            className="absolute z-50"
            style={{
              right: '-20px', // Equal spacing from container edge
              top: `${(cardWidth <= 280 ? 90 : 80)}px`,
              height: `${minCardHeight}px`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Button
              variant="outline"
              size="icon"
              className={`${cardWidth <= 280 ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-white dark:bg-gray-800 border-2 shadow-xl hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transition-all duration-200`}
              onClick={nextSlide}
            >
              <ChevronRight className={cardWidth <= 280 ? 'h-5 w-5' : 'h-6 w-6'} />
            </Button>
          </div>
        </>
      )}
      
    </div>
  )
}

// Example usage component
export function CardStackCarouselDemo() {
  const sampleCards = [
    <div key="1" className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">LUXORA</div>
        <div className="text-xl">♡</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-24 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-sm">Product Image</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Premium Bag</div>
        <div className="text-2xl font-bold">$1,800</div>
        <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>,
    
    <div key="2" className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">GRANDEUR</div>
        <div className="text-xl">♡</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-24 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-sm">Product Image</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Luxury Handbag</div>
        <div className="text-2xl font-bold">$2,400</div>
        <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>,
    
    <div key="3" className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">PRESTIGIO</div>
        <div className="text-xl">♡</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-24 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-sm">Product Image</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Designer Bag</div>
        <div className="text-2xl font-bold">$4,500</div>
        <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>,
    
    <div key="4" className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 p-6 text-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">ELEGANZA</div>
        <div className="text-xl">♡</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-24 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-sm">Product Image</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Elite Collection</div>
        <div className="text-2xl font-bold">$3,500</div>
        <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>,
    
    <div key="5" className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">AZURE</div>
        <div className="text-xl">♡</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-24 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-sm">Product Image</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Premium Series</div>
        <div className="text-2xl font-bold">$2,200</div>
        <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors">
          + Add to Cart
        </button>
      </div>
    </div>
  ]
  
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Card Stack Carousel</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Experience our products in a stunning 3D card stack layout
        </p>
      </div>
      
      <CardStackCarousel 
        autoPlay={true} 
        autoPlayInterval={5000}
        cardWidth={320}
minCardHeight={400}
        className="py-8"
      >
        {sampleCards}
      </CardStackCarousel>
    </div>
  )
}
