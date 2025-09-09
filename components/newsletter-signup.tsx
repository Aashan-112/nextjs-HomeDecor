"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, Gift, Bell, ArrowRight } from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { toast } from "sonner"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsSubscribing(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Welcome! Check your email for your 15% discount code 🎉")
      setEmail("")
      setIsSubscribing(false)
    }, 1000)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-accent/5 to-accent/10 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-accent rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent rounded-full animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
              <Gift className="h-5 w-5 text-accent animate-bounce-soft" />
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Special Offer
              </Badge>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Craft Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Get exclusive access to new collections, artisan stories, and special offers
            </p>
            <p className="text-accent font-semibold">
              🎁 Plus get 15% off your first order!
            </p>
          </div>
        </AnimatedContainer>

        <StaggerContainer 
          className="max-w-md mx-auto mb-8"
          staggerDelay={200}
          initialDelay={400}
          animation="slideUp"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-4 pr-12 bg-background/80 backdrop-blur border-border/50 hover-glow focus:scale-[1.02] transition-all duration-300"
                disabled={isSubscribing}
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubscribing}
              className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90 hover-lift transition-all duration-300"
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-foreground border-t-transparent mr-2"></div>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </StaggerContainer>

        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          staggerDelay={150}
          initialDelay={600}
          animation="scale"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3 hover-scale cursor-default">
              <Bell className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Early Access</h3>
            <p className="text-sm text-muted-foreground">Be first to know about new arrivals</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3 hover-scale cursor-default">
              <Gift className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Exclusive Offers</h3>
            <p className="text-sm text-muted-foreground">Special discounts just for subscribers</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3 hover-scale cursor-default">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Artisan Stories</h3>
            <p className="text-sm text-muted-foreground">Learn about our craftspeople</p>
          </div>
        </StaggerContainer>

        <AnimatedContainer animation="fade" delay={800} className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            No spam, ever. Unsubscribe anytime. Your privacy matters to us.
          </p>
        </AnimatedContainer>
      </div>
    </section>
  )
}
