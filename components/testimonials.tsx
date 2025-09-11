"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { ElevatedCarousel } from "@/components/ui/elevated-carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid3X3, Layers3 } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/avatars/sarah.jpg",
    location: "New York, USA",
    rating: 5,
    review: "Absolutely stunning! The handcrafted mirror I ordered exceeded my expectations. The quality is exceptional and it's become the centerpiece of my living room.",
    product: "Rustic Wooden Mirror",
    verified: true,
    image: "/elegant-handcrafted-mirror-with-ornate-frame.png"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "/avatars/michael.jpg",
    location: "California, USA",
    rating: 5,
    review: "The attention to detail is incredible. You can tell each piece is made with love and care. Fast shipping and beautiful packaging too!",
    product: "Ceramic Table Lamp",
    verified: true,
    image: "/ceramic-table-lamp.png"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "/avatars/emily.jpg",
    location: "Texas, USA", 
    rating: 5,
    review: "I've ordered multiple pieces and each one is unique and beautiful. The customer service is outstanding - they really care about their customers.",
    product: "Macrame Wall Hanging",
    verified: true,
    image: "/macrame-wall-hanging.png"
  }
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
        </AnimatedContainer>

        {/* Display Toggle */}
        <AnimatedContainer animation="slideUp" delay={400} className="mb-8">
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-background/80 backdrop-blur border border-border/50">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid View</span>
                </TabsTrigger>
                <TabsTrigger value="elevated" className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Spotlight View</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="space-y-8">
              <StaggerContainer 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                staggerDelay={150}
                initialDelay={100}
                animation="slideUp"
              >
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="group border-border/50 hover:border-accent/50 transition-all duration-300 hover-lift bg-background/80 backdrop-blur">
                    <CardContent className="p-6">
                      <Quote className="h-8 w-8 text-accent/30 mb-4 group-hover:text-accent/50 transition-colors" />
                      
                      <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                        "{testimonial.review}"
                      </blockquote>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/10">
                          <img 
                            src={testimonial.image}
                            alt={testimonial.product}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{testimonial.product}</div>
                          <StarRating rating={testimonial.rating} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback className="bg-accent/10 text-accent">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground text-sm">{testimonial.name}</div>
                            <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                          </div>
                        </div>
                        
                        {testimonial.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover-scale">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="elevated" className="space-y-8">
              <div className="max-w-5xl mx-auto">
                <ElevatedCarousel 
                  autoPlay={true} 
                  autoPlayInterval={8000}
                  className="py-4"
                >
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="group border-border/50 hover:border-accent/50 transition-all duration-300 hover-lift bg-background/80 backdrop-blur mx-2">
                      <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-accent/30 mb-4 group-hover:text-accent/50 transition-colors" />
                        
                        <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                          "{testimonial.review}"
                        </blockquote>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/10">
                            <img 
                              src={testimonial.image}
                              alt={testimonial.product}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{testimonial.product}</div>
                            <StarRating rating={testimonial.rating} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback className="bg-accent/10 text-accent">
                                {testimonial.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground text-sm">{testimonial.name}</div>
                              <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                            </div>
                          </div>
                          
                          {testimonial.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover-scale">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ElevatedCarousel>
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedContainer>

        <AnimatedContainer animation="scale" delay={800} className="text-center">
          <div className="inline-flex items-center gap-4 bg-background/80 backdrop-blur rounded-xl px-8 py-4 border border-border/50">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="font-semibold text-foreground">5.0</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-muted-foreground text-sm">
              Based on <span className="font-semibold text-foreground">1000+</span> reviews
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  )
}
