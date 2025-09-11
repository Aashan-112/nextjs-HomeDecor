"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"
import { getCategories } from "@/lib/data/data-sync"
import type { Category } from "@/lib/types"

export function CategoriesPreview() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories()
        // Show only first 4 categories for preview
        setCategories((data || []).slice(0, 4))
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading || categories.length === 0) return null

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedContainer animation="slideUp" delay={200}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Shop by Category</h2>
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections of handcrafted home décor
            </p>
          </div>
        </AnimatedContainer>

        <StaggerContainer 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          staggerDelay={150}
          initialDelay={400}
          animation="slideUp"
        >
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`}>
              <Card className="group overflow-hidden hover-lift transition-all duration-300 hover:shadow-xl border-0 bg-background/60 backdrop-blur">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-accent/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <h3 className="font-semibold text-sm sm:text-lg mb-1">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-white/80 hidden sm:block">{category.description || "Handcrafted pieces"}</p>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors text-sm sm:text-base">
                        {category.name}
                      </h3>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </StaggerContainer>

        <AnimatedContainer animation="scale" delay={800} className="text-center">
          <Button size="lg" variant="outline" className="hover-lift hover-glow transition-all" asChild>
            <Link href="/categories">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimatedContainer>
      </div>
    </section>
  )
}
