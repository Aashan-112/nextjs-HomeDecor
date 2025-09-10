"use client"

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
  RefreshCw
} from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"

const features = [
  {
    icon: Heart,
    title: "Handcrafted with Love",
    description: "Each piece is carefully crafted by skilled artisans using traditional techniques passed down through generations.",
    badge: "Authentic"
  },
  {
    icon: Shield,
    title: "Premium Quality Materials",
    description: "We use only the finest materials sourced responsibly to ensure durability and beauty in every piece.",
    badge: "Quality"
  },
  {
    icon: Truck,
    title: "Fast & Free Shipping",
    description: "Free shipping on orders over $100. Most orders ship within 24 hours with tracking included.",
    badge: "Free Shipping"
  },
  {
    icon: Award,
    title: "Customer Satisfaction",
    description: "5-star average rating from 1000+ happy customers. Your satisfaction is our top priority.",
    badge: "5⭐ Rated"
  },
  {
    icon: Users,
    title: "Supporting Local Artisans",
    description: "By choosing us, you directly support local craftspeople and help preserve traditional art forms.",
    badge: "Social Impact"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle-free returns. If you're not completely satisfied, we'll make it right.",
    badge: "30-Day Returns"
  }
]

export function WhyChooseUs() {
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

        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={150}
          initialDelay={400}
          animation="slideUp"
        >
          {features.map((feature, index) => (
            <Card key={index} className="group border-border/50 hover:border-accent/50 transition-all duration-300 hover-lift bg-background/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-accent text-accent-foreground hover-scale animate-fadeInRight animate-delay-300"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </StaggerContainer>

        {/* Trust Statistics */}
        <AnimatedContainer animation="slideUp" delay={800} className="mt-16">
          <div className="bg-accent/5 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-8">Trusted by Thousands</h3>
            <StaggerContainer 
              className="grid grid-cols-1 sm:grid-cols-4 gap-8"
              staggerDelay={100}
              animation="scale"
            >
              <div className="hover-scale cursor-default">
                <div className="text-3xl font-bold text-accent mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="hover-scale cursor-default">
                <div className="text-3xl font-bold text-accent mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Products Sold</div>
              </div>
              <div className="hover-scale cursor-default">
                <div className="text-3xl font-bold text-accent mb-2">5⭐</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="hover-scale cursor-default">
                <div className="text-3xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </StaggerContainer>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  )
}
