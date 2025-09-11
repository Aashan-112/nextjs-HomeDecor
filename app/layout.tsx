import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { AuthPromptProvider } from "@/components/auth/auth-prompt-provider"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as CustomToaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "99 Arts and Crafts - Handcrafted Mirrors & Home Accessories",
  description:
    "Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories. Premium quality items for your home from 99 Arts and Crafts.",
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
            <WishlistProvider>
              <AuthPromptProvider>
                {children}
              </AuthPromptProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
        <CustomToaster />
      </body>
    </html>
  )
}
