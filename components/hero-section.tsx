"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <StaggerContainer className="space-y-4" staggerDelay={200} initialDelay={300}>
              <Badge variant="secondary" className="bg-accent text-accent-foreground hover-glow inline-block">
                Handcrafted Excellence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                99 Arts and Crafts
                <span className="text-accent block">Made with Love</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md text-pretty">
                Discover unique handcrafted mirrors and home accessories. Each piece is carefully crafted by skilled
                artisans using traditional techniques and premium materials.
              </p>
            </StaggerContainer>

            <AnimatedContainer animation="slideUp" delay={900} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-lift" asChild>
                <Link href="/products">Shop Collection</Link>
              </Button>
              <Button size="lg" variant="outline" className="hover-lift" asChild>
                <Link href="/about">Our Story</Link>
              </Button>
            </AnimatedContainer>

            {/* Features */}
            <StaggerContainer 
              className="grid grid-cols-3 gap-4 pt-8" 
              staggerDelay={150} 
              initialDelay={1200}
              animation="scale"
            >
              <div className="text-center hover-scale cursor-default">
                <div className="text-2xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">Unique Pieces</div>
              </div>
              <div className="text-center hover-scale cursor-default">
                <div className="text-2xl font-bold text-foreground">5★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
              <div className="text-center hover-scale cursor-default">
                <div className="text-2xl font-bold text-foreground">24h</div>
                <div className="text-sm text-muted-foreground">Fast Shipping</div>
              </div>
            </StaggerContainer>
          </div>

          {/* Hero Image */}
          <AnimatedContainer animation="scale" delay={600} className="relative">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-accent/20 hover-lift">
              <Image
                src="/elegant-handcrafted-mirror-with-ornate-frame.png"
                alt="Handcrafted ornate mirror"
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
                priority
              />

              {/* Floating Elements */}
              <AnimatedContainer 
                animation="slideLeft" 
                delay={1500}
                className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 animate-float hover-glow"
              >
                <div className="text-sm font-medium text-foreground">Premium Quality</div>
                <div className="text-xs text-muted-foreground">Handcrafted</div>
              </AnimatedContainer>

              <AnimatedContainer 
                animation="slideRight" 
                delay={1800}
                className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 animate-float hover-glow"
                duration={700}
              >
                <div className="text-sm font-medium text-foreground">Free Shipping</div>
                <div className="text-xs text-muted-foreground">Orders over $100</div>
              </AnimatedContainer>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  )
}
