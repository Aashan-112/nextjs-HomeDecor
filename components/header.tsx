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
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center border border-black overflow-hidden">
              <img src="/logo.webp" alt="Arts & Crafts" className="h-10 w-10 rounded-full object-cover" />
            </div>
            <span className="font-bold text-xl text-foreground">Arts & Crafts</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search handcrafted mirrors..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 mr-6">
              <Link href="/categories" className="text-sm font-medium hover:text-accent transition-colors">
                Categories
              </Link>
              <Link href="/featured" className="text-sm font-medium hover:text-accent transition-colors">
                Featured
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">
                About
              </Link>
            </nav>

            {/* Action Buttons */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                      {wishlistCount}
                    </Badge>
                  )}
                </div>
              </Link>
            </Button>

            {/* Mini Cart Component */}
            <MiniCart />

            <Button variant="ghost" size="icon" asChild>
              <Link href={user ? "/account" : "/auth/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search handcrafted mirrors..."
                  className="pl-10 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-3">
              <Link
                href="/categories"
                className="text-sm font-medium hover:text-accent transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/featured"
                className="text-sm font-medium hover:text-accent transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Featured
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-accent transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {!user && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:text-accent transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-sm font-medium hover:text-accent transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}