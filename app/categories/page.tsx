"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getImageSrc } from "@/lib/utils/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/types"
import { getCategories as getHybridCategories } from "@/lib/data/data-sync"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getHybridCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shop by Category</h1>
          <p className="text-lg text-muted-foreground">Explore our curated collections of handcrafted home decor</p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 sm:space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-1 sm:space-y-2">
                  <Skeleton className="h-4 sm:h-6 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="group overflow-hidden border-border/50 hover:border-border transition-colors">
                  <div className="relative">
                    <AspectRatio ratio={1}>
                      <img
                        src={getImageSrc(category.image_url)}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </AspectRatio>
                  </div>
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors mb-1 sm:mb-2 text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No categories found</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
