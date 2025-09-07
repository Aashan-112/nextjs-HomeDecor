import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Handcrafted Excellence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                Arts & Crafts
                <span className="text-accent block">Made with Love</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md text-pretty">
                Discover unique handcrafted mirrors and home accessories. Each piece is carefully crafted by skilled
                Arts & Crafts using traditional techniques and premium materials.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/products">Shop Collection</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Our Story</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">Unique Pieces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">5★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24h</div>
                <div className="text-sm text-muted-foreground">Fast Shipping</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-accent/20">
              <Image
                src="/elegant-handcrafted-mirror-with-ornate-frame.png"
                alt="Handcrafted ornate mirror"
                fill
                className="object-cover"
                priority
              />

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-foreground">Premium Quality</div>
                <div className="text-xs text-muted-foreground">Handcrafted</div>
              </div>

              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-foreground">Free Shipping</div>
                <div className="text-xs text-muted-foreground">Orders over $100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
