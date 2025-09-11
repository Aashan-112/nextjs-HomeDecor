"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, User, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { MiniCart } from "@/components/mini-cart"
import { AnimatedContainer } from "@/components/ui/animated-container"
import { StaggerContainer } from "@/components/ui/stagger-container"

type HeaderProps = {
  /**
   * Optional cart items count accepted for compatibility with callers.
   * Note: MiniCart renders its own badge using cart context.
   */
  cartItemsCount?: number
}

export function Header({ cartItemsCount: _cartItemsCount }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const { itemsCount: wishlistCount } = useWishlist()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <AnimatedContainer animation="slideRight" delay={100}>
            <Link href="/" className="flex items-center space-x-2 hover-scale transition-all duration-300">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center border border-black overflow-hidden hover-glow">
                <img src="/logo.webp" alt="99 Arts and Crafts" className="h-10 w-10 rounded-full object-cover transition-transform hover:scale-110" />
              </div>
              <span className="font-bold text-xl text-foreground">99 Arts and Crafts</span>
            </Link>
          </AnimatedContainer>

          {/* Search Bar - Desktop */}
          <AnimatedContainer animation="slideDown" delay={300} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
              <Input
                type="search"
                placeholder="Search handcrafted mirrors..."
                className="pl-10 bg-muted/50 hover-glow focus:scale-[1.02] transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </AnimatedContainer>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            <StaggerContainer 
              className="hidden md:flex items-center space-x-6 mr-6" 
              staggerDelay={100} 
              initialDelay={500}
              animation="slideDown"
            >
              <Link href="/categories" className="text-sm font-medium hover:text-accent transition-all hover:scale-110">
                Categories
              </Link>
              <Link href="/featured" className="text-sm font-medium hover:text-accent transition-all hover:scale-110">
                Featured
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-accent transition-all hover:scale-110">
                About
              </Link>
            </StaggerContainer>

            {/* Action Buttons */}
            <StaggerContainer 
              className="flex items-center space-x-2" 
              staggerDelay={150} 
              initialDelay={700}
              animation="scale"
            >
              <Button variant="ghost" size="icon" className="hover-scale hover-glow transition-all duration-300" asChild>
                <Link href="/wishlist">
                  <div className="relative">
                    <Heart className="h-5 w-5 transition-transform hover:scale-110" />
                    {wishlistCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground animate-bounce-soft">
                        {wishlistCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              </Button>

              {/* Mini Cart Component */}
              <MiniCart />

              <Button variant="ghost" size="icon" className="hover-scale hover-glow transition-all duration-300" asChild>
                <Link href={user ? "/account" : "/auth/login"}>
                  <User className="h-5 w-5 transition-transform hover:scale-110" />
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover-scale transition-all duration-300" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative w-5 h-5">
                  <Menu className={`h-5 w-5 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                  <X className={`h-5 w-5 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                </div>
              </Button>
            </StaggerContainer>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <AnimatedContainer 
            animation="slideDown" 
            className="md:hidden border-t py-4 bg-background/95 backdrop-blur-sm"
          >
            {/* Mobile Search */}
            <AnimatedContainer animation="slideUp" delay={100} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                <Input
                  type="search"
                  placeholder="Search handcrafted mirrors..."
                  className="pl-10 bg-muted/50 hover-glow focus:scale-[1.02] transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </AnimatedContainer>

            {/* Mobile Navigation */}
            <StaggerContainer 
              className="flex flex-col space-y-3" 
              staggerDelay={100} 
              initialDelay={200}
              animation="slideLeft"
            >
              <Link
                href="/categories"
                className="text-sm font-medium hover:text-accent transition-all py-2 hover:translate-x-2 hover:bg-muted/30 rounded px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/featured"
                className="text-sm font-medium hover:text-accent transition-all py-2 hover:translate-x-2 hover:bg-muted/30 rounded px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Featured
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-accent transition-all py-2 hover:translate-x-2 hover:bg-muted/30 rounded px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {!user && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:text-accent transition-all py-2 hover:translate-x-2 hover:bg-muted/30 rounded px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-sm font-medium hover:text-accent transition-all py-2 hover:translate-x-2 hover:bg-muted/30 rounded px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </StaggerContainer>
          </AnimatedContainer>
        )}
      </div>
    </header>
  )
}