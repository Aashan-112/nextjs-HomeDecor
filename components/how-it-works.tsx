"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  Palette, 
  Hammer, 
  PackageCheck,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"

const steps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Design & Inspiration",
    description: "Our artisans draw inspiration from nature, culture, and traditional patterns to create unique designs.",
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    step: "02", 
    icon: Palette,
    title: "Material Selection",
    description: "We carefully select premium, sustainable materials - from solid wood to natural fibers and metals.",
    color: "from-purple-500/20 to-purple-600/20"
  },
  {
    step: "03",
    icon: Hammer,
    title: "Handcrafted Creation",
    description: "Skilled craftspeople bring each piece to life using time-honored techniques and modern precision.",
    color: "from-orange-500/20 to-orange-600/20"
  },
  {
    step: "04",
    icon: PackageCheck,
    title: "Quality & Delivery",
    description: "Each piece undergoes rigorous quality checks before being carefully packaged and shipped to you.",
    color: "from-green-500/20 to-green-600/20"
  }
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,219,172,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Our Crafts Come to Life</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From initial inspiration to your doorstep - discover the journey of our handcrafted pieces
            </p>
          </div>
        </AnimatedContainer>

        <div className="max-w-5xl mx-auto">
          <StaggerContainer 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            staggerDelay={200}
            initialDelay={400}
            animation="slideUp"
          >
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group border-border/50 hover:border-accent/50 transition-all duration-300 hover-lift bg-background/80 backdrop-blur h-full">
                  <CardContent className="p-6 text-center relative">
                    {/* Step Number Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground font-bold hover-scale"
                    >
                      {step.step}
                    </Badge>

                    {/* Icon with Gradient Background */}
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="h-10 w-10 text-accent" />
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Arrow Connector for Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 bg-background rounded-full border-2 border-accent/30 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-accent animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </StaggerContainer>
        </div>

        {/* Call to Action */}
        <AnimatedContainer animation="scale" delay={1000} className="text-center mt-12">
          <div className="bg-accent/5 rounded-2xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Own a Handcrafted Masterpiece?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Each piece tells a story and brings authentic craftsmanship to your home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Unique pieces</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Premium materials</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Expert craftsmanship</span>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  )
}
