"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Shield, 
  Truck, 
  Award, 
  Users, 
  Sparkles,
  Clock,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { CardStackCarousel } from "@/components/ui/card-stack-carousel"

const features = [
  {
    title: "100% Authentic",
    description: "100% Handcrafted in Pakistan – No two pieces are exactly alike",
    isExpanded: true // First item expanded by default
  },
  {
    title: "Modern Elegance",
    description: "Contemporary designs that blend traditional craftsmanship with modern aesthetics for today's homes.",
    isExpanded: false
  },
  {
    title: "Durable",
    description: "Built to last with premium materials and time-tested techniques ensuring longevity and beauty.",
    isExpanded: false
  },
  {
    title: "Easy to use",
    description: "Designed with functionality in mind, our pieces are as practical as they are beautiful.",
    isExpanded: false
  },
  {
    title: "Versatile Designs",
    description: "Adaptable pieces that complement any decor style and space, from traditional to contemporary.",
    isExpanded: false
  }
]

export function WhyChooseUs() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0])); // First item expanded by default

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Our Crafts?</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes our handcrafted pieces special and why thousands of customers trust us
            </p>
          </div>
        </AnimatedContainer>

        {/* Accordion Layout */}
        <div className="max-w-4xl mx-auto">
          <StaggerContainer 
            className="space-y-4"
            staggerDelay={150}
            initialDelay={400}
            animation="slideUp"
          >
            {features.map((feature, index) => {
              const isExpanded = expandedItems.has(index)
              return (
                <div 
                  key={index} 
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: '#CD7F32' }}
                >
                  {/* Header - Always Visible */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-black/10 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkmark */}
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 text-white/80 transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-white/80 transition-transform duration-300" />
                      )}
                    </div>
                  </button>
                  
                  {/* Expandable Content */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6 pl-18">
                      <p className="text-white/90 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </StaggerContainer>
        </div>

      </div>
    </section>
  )
}
