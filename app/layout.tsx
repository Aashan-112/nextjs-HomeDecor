import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as CustomToaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Arts & Crafts Home Decor - Handcrafted Mirrors & Home Accessories",
  description:
    "Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories. Premium quality Arts & Crafts-made items for your home.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
        <CustomToaster />
      </body>
    </html>
  )
}
