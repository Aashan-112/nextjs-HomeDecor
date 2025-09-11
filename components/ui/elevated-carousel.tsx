"use client"

import { ReactNode, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ElevatedCarouselProps {
  children: ReactNode[]
  className?: string
  showNavigation?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function ElevatedCarousel({ 
  children, 
  className = "", 
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 4000
}: ElevatedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Ensure we have at least 3 items to show the layout properly
  const items = children.length >= 3 ? children : [...children, ...children, ...children].slice(0, Math.max(3, children.length))
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length - 2))
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, items.length - 2)) % Math.max(1, items.length - 2))
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
  
  // Get the three visible items
  const getVisibleItems = () => {
    const visibleItems = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % items.length
      visibleItems.push({ content: items[index], index })
    }
    return visibleItems
  }
  
  const visibleItems = getVisibleItems()
  
  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Carousel Container */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        {/* Elevated (Top) Card */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500 ease-in-out">
          <div className="w-[280px] md:w-[320px] transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
              {visibleItems[0]?.content}
            </div>
          </div>
        </div>
        
        {/* Bottom Left Card */}
        <div className="absolute bottom-0 left-4 md:left-8 z-20 transition-all duration-500 ease-in-out">
          <div className="w-[240px] md:w-[280px] transform hover:scale-105 transition-transform duration-300 opacity-80 hover:opacity-100">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg">
              {visibleItems[1]?.content}
            </div>
          </div>
        </div>
        
        {/* Bottom Right Card */}
        <div className="absolute bottom-0 right-4 md:right-8 z-20 transition-all duration-500 ease-in-out">
          <div className="w-[240px] md:w-[280px] transform hover:scale-105 transition-transform duration-300 opacity-80 hover:opacity-100">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg">
              {visibleItems[2]?.content}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {showNavigation && items.length > 3 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
      
      {/* Dot Indicators */}
      {items.length > 3 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.max(1, items.length - 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Progress Bar (Optional) */}
      {autoPlay && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-50">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % autoPlayInterval) / autoPlayInterval) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Example usage component
export function ElevatedCarouselDemo() {
  const sampleCards = [
    <div key="1" className="p-6 text-center">
      <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Card 1</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Featured Product 1</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Amazing product description here</p>
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">$99.99</span>
      </div>
    </div>,
    
    <div key="2" className="p-6 text-center">
      <div className="w-full h-40 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Card 2</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Featured Product 2</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Another great product</p>
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">$149.99</span>
      </div>
    </div>,
    
    <div key="3" className="p-6 text-center">
      <div className="w-full h-40 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Card 3</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Featured Product 3</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Exceptional quality item</p>
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">$199.99</span>
      </div>
    </div>,
    
    <div key="4" className="p-6 text-center">
      <div className="w-full h-40 bg-gradient-to-br from-red-400 to-red-600 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Card 4</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Featured Product 4</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Premium product offering</p>
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">$299.99</span>
      </div>
    </div>,
    
    <div key="5" className="p-6 text-center">
      <div className="w-full h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Card 5</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Featured Product 5</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Exclusive limited edition</p>
      <div className="mt-4">
        <span className="text-2xl font-bold text-green-600">$399.99</span>
      </div>
    </div>
  ]
  
  return (
    <ElevatedCarousel 
      autoPlay={true} 
      autoPlayInterval={5000}
      className="py-8"
    >
      {sampleCards}
    </ElevatedCarousel>
  )
}
