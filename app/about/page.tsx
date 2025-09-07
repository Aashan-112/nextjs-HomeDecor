"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Heart, Award, Users, Leaf } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Handcrafted with Love, Designed for Life
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                At Arts & Crafts, we believe every home deserves unique, handcrafted pieces that tell a story. Our collection
                of mirrors, wall art, and home accessories are created by skilled Arts & Crafts who pour their passion into
                every detail.
              </p>
              <Button size="lg" asChild>
                <Link href="/products">Explore Our Collection</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Qui odio eligendi accusantium hic maiores veniam voluptatem aperiam libero cupiditate minus, autem ducimus. Quae fugiat aut nulla impedit quisquam earum quod!
                  </p>
                  <p>
                   Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat commodi, vel modi aperiam explicabo optio libero excepturi mollitia inventore ullam possimus sit sapiente quidem temporibus eveniet, odit ad aut praesentium.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur quasi sit quod sapiente, exercitationem aspernatur. Dignissimos, molestias quasi delectus aliquid voluptates ipsa laborum quis placeat doloribus corrupti nemo similique eligendi!
                  </p>
                </div>
              </div>
              <div className="relative">
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src="/artisan-workshop-crafting-mirrors.png"
                    alt="Arts & Crafts workshop"
                    fill
                    className="object-cover rounded-lg"
                  />
                </AspectRatio>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">What We Stand For</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our values guide everything we do, from the Arts & Crafts we partner with to the products we curate for your
                home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent/90 shadow-sm">
                    <Heart className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Handcrafted Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Every piece is carefully crafted by skilled Arts & Crafts using traditional techniques
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent/90 shadow-sm">
                    <Award className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Exceptional Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Unique designs that blend traditional craftsmanship with contemporary aesthetics
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent/90 shadow-sm">
                    <Users className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Fair Trade</h3>
                  <p className="text-sm text-muted-foreground">
                    We ensure fair wages and working conditions for all our Arts & Crafts partners
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent/90 shadow-sm">
                    <Leaf className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Sustainable</h3>
                  <p className="text-sm text-muted-foreground">
                    Eco-friendly materials and sustainable production methods
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">From Arts & Crafts to Your Home</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Each piece goes through a careful journey from conception to your doorstep
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-foreground mb-2">Design & Create</h3>
                <p className="text-muted-foreground">
                  Our Arts & Crafts design and handcraft each piece using traditional techniques and premium materials
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-foreground mb-2">Quality Check</h3>
                <p className="text-muted-foreground">
                  Every item undergoes rigorous quality inspection to ensure it meets our high standards
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-foreground mb-2">Careful Delivery</h3>
                <p className="text-muted-foreground">
                  We package each piece with care and deliver it safely to your home
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
            <p className="text-xl mb-8 opacity-90">
              Discover our collection of handcrafted mirrors and home accessories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/featured">View Featured Items</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
