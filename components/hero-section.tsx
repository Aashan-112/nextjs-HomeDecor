"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { AnimatedCounter } from "@/components/floating-elements"

export function HeroSection() {
  return (
    <section className="relative h-[110vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/elegant-handcrafted-mirror-with-ornate-frame.png"
          alt="Handcrafted furniture background"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Floating particles for visual enhancement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float" style={{animationDuration: '6s'}} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '1s'}} />
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-white/20 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '2s'}} />
        <div className="absolute top-1/5 right-1/4 w-2 h-2 bg-white/25 rounded-full animate-float" style={{animationDuration: '9s', animationDelay: '3s'}} />
      </div>
      
      {/* Centered Content */}
      <div className="relative z-10 h-full flex items-center justify-center" style={{transform: 'translateY(-10vh)'}}>
        <div className="text-center max-w-4xl mx-auto px-4">
          <StaggerContainer className="space-y-6" staggerDelay={200} initialDelay={300}>
            
            {/* Main Heading */}
            <AnimatedContainer animation="slideUp" delay={500}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                99 Arts and Crafts
                <span className="text-accent block mt-1">Made with Love</span>
              </h1>
            </AnimatedContainer>
            
            {/* Description */}
            <AnimatedContainer animation="slideUp" delay={700}>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Discover unique handcrafted mirrors and home accessories. Each piece is carefully crafted by skilled artisans using traditional techniques and premium materials.
              </p>
            </AnimatedContainer>
            
            {/* Buttons */}
            <AnimatedContainer animation="slideUp" delay={900} className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 hover-lift transform transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/10 relative overflow-hidden group px-8 py-4 text-lg font-semibold" 
                asChild
              >
                <Link href="/products">
                  <span className="relative z-10">Shop Collection</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-black hover-lift transform transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/10 px-8 py-4 text-lg font-semibold" 
                asChild
              >
                <Link href="/about">
                  Our Story
                </Link>
              </Button>
            </AnimatedContainer>
            
          </StaggerContainer>
        </div>
      </div>
      
    </section>
  )
}
