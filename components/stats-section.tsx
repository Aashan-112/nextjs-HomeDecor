"use client"

import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { AnimatedCounter, useScrollAnimation } from "@/components/floating-elements"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  ShoppingBag, 
  Star, 
  Truck, 
  Award, 
  Heart,
  Globe,
  Shield,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle
} from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Happy Customers",
    description: "Satisfied customers worldwide",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-600"
  },
  {
    icon: ShoppingBag,
    value: 5000,
    suffix: "+",
    label: "Orders Delivered",
    description: "Successfully completed orders",
    color: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-600"
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "/5",
    label: "Average Rating",
    description: "Based on customer reviews",
    color: "from-yellow-500/20 to-yellow-600/20",
    iconColor: "text-yellow-600"
  },
  {
    icon: Globe,
    value: 45,
    suffix: "+",
    label: "Countries Served",
    description: "Worldwide shipping coverage",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-600"
  }
]

const achievements = [
  {
    icon: Award,
    title: "Artisan Excellence",
    description: "Certified quality craftsmanship",
    color: "bg-gradient-to-r from-yellow-500/10 to-orange-500/10",
    iconColor: "text-yellow-600"
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Safe & encrypted transactions",
    color: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over PKR 7500",
    color: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600"
  },
  {
    icon: Heart,
    title: "Loved by Many",
    description: "5-star customer satisfaction",
    color: "bg-gradient-to-r from-pink-500/10 to-red-500/10",
    iconColor: "text-pink-600"
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Same day order processing",
    color: "bg-gradient-to-r from-purple-500/10 to-violet-500/10",
    iconColor: "text-purple-600"
  },
  {
    icon: CheckCircle,
    title: "Quality Guaranteed",
    description: "30-day money back guarantee",
    color: "bg-gradient-to-r from-teal-500/10 to-cyan-500/10",
    iconColor: "text-teal-600"
  }
]

function AchievementBadge({ achievement, index }: { achievement: any, index: number }) {
  const [ref, isVisible] = useScrollAnimation(0.2)

  return (
    <div ref={ref}>
      <AnimatedContainer 
        animation="scale" 
        delay={index * 100}
        className={`transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
          isVisible ? 'animate-fadeInUp' : ''
        }`}
      >
        <div className={`group relative overflow-hidden rounded-2xl ${achievement.color} border border-accent/20 hover:border-accent/40 transition-all duration-300 backdrop-blur-sm hover:shadow-xl`}>
          {/* Floating particles */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent/50 rounded-full animate-ping" />
          <div className="absolute top-2 left-2 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 group-hover:from-white/10 group-hover:to-black/10 transition-all duration-300"></div>
          
          <div className="relative p-6 text-center">
            {/* Icon Container */}
            <div className="mb-4 relative">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-background/50 via-background/30 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <achievement.icon className={`h-8 w-8 ${achievement.iconColor} group-hover:animate-bounce transition-all duration-300`} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-accent/30 group-hover:scale-125 group-hover:border-accent/50 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            </div>
            
            <h3 className="font-bold text-foreground mb-2 text-sm group-hover:text-accent transition-colors">{achievement.title}</h3>
            <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors leading-relaxed">{achievement.description}</p>
            
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-accent via-primary to-accent group-hover:w-full transition-all duration-500 rounded-t-full"></div>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-background via-accent/5 to-secondary/10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-6 py-3 mb-4">
              <span className="text-sm font-medium text-accent tracking-wide uppercase">Our Achievements</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Numbers that speak for our commitment to quality and customer satisfaction
            </p>
          </div>
        </AnimatedContainer>

        {/* Statistics Grid - New Circular Design */}
        <StaggerContainer 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          staggerDelay={150}
          initialDelay={400}
          animation="slideUp"
        >
          {stats.map((stat, index) => (
            <div key={index} className="group relative">
              {/* Circular Progress Background */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl"></div>
                
                {/* Inner Circle */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-all duration-300">
                  {/* Icon */}
                  <div className={`mb-2 p-2 rounded-full bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-8 w-8 ${stat.iconColor} group-hover:animate-bounce`} />
                  </div>
                  
                  {/* Counter */}
                  <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix}
                      duration={2500}
                    />
                  </div>
                </div>
                
                {/* Floating Dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent/60 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Labels */}
              <div className="text-center">
                <h3 className="font-bold text-foreground mb-2 group-hover:text-accent transition-colors text-lg">{stat.label}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{stat.description}</p>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/0 via-primary/0 to-secondary/0 group-hover:from-accent/5 group-hover:via-primary/5 group-hover:to-secondary/5 transition-all duration-500 -z-10 blur-xl"></div>
            </div>
          ))}
        </StaggerContainer>

        {/* Achievement Badges */}
        <AnimatedContainer animation="slideUp" delay={800}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
              Why Choose Us
            </h3>
            <p className="text-muted-foreground">
              Experience the difference with our premium service and quality guarantee
            </p>
          </div>
        </AnimatedContainer>

        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          staggerDelay={150}
          initialDelay={400}
          animation="slideUp"
        >
          {achievements.map((achievement, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover-lift">
              {/* Gradient Background Overlay */}
              <div className={`absolute inset-0 ${achievement.color.replace('bg-gradient-to-r', 'bg-gradient-to-br')} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <CardContent className="p-8 text-center relative z-10">
                {/* Icon with Gradient Background */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-2xl ${achievement.color.replace('from-', 'from-').replace('/10', '')} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <achievement.icon className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Decorative Ring */}
                  <div className={`absolute inset-0 w-20 h-20 mx-auto rounded-2xl border-2 border-transparent ${achievement.color.replace('from-', 'from-').replace('/10', '/30')} opacity-20 scale-125 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700`} />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                  {achievement.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {achievement.description}
                </p>

                {/* Floating Dots Decoration */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${achievement.color.replace('bg-gradient-to-r', 'bg-gradient-to-r').replace('/10', '')}`} />
                    <div className={`w-2 h-2 rounded-full ${achievement.color.replace('bg-gradient-to-r', 'bg-gradient-to-r').replace('/10', '')} animate-pulse`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </StaggerContainer>

        {/* Call to Action */}
        <AnimatedContainer animation="scale" delay={1200} className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-border/30">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border-2 border-white animate-pulse" />
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white animate-pulse" style={{animationDelay: '0.2s'}} />
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full border-2 border-white animate-pulse" style={{animationDelay: '0.4s'}} />
              </div>
              <span className="font-semibold text-foreground">Join our community</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-muted-foreground text-sm">
              <AnimatedCounter end={99} suffix="%" className="font-bold text-primary" /> customer satisfaction rate
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  )
}
