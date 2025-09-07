import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl">Arts & Crafts</span>
            </div>
            <p className="text-primary-foreground/80 text-sm text-pretty">
              Handcrafted home decor pieces made with love and traditional techniques. Each item tells a unique story.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent" asChild>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent" asChild>
                <a href="https://www.instagram.com/99_arts_and_crafts?igsh=MXJiNDZ1enMyam8wcQ==" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent" asChild>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                All Products
              </Link>
              <Link
                href="/categories"
                className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
              >
                Categories
              </Link>
              <Link href="/featured" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                Featured
              </Link>
              <Link href="/about" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                About Us
              </Link>
              <Link href="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Service</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/shipping" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                Returns & Exchanges
              </Link>
              <Link
                href="/size-guide"
                className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
              >
                Size Guide
              </Link>
              <Link href="/care" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                Care Instructions
              </Link>
              <Link href="/faq" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-primary-foreground/80 text-sm">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Subscribe</Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>hello@Arts & Crafts.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+92 300 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">© 2024 Arts & Crafts Home Decor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
