import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { AuthPromptProvider } from "@/components/auth/auth-prompt-provider"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as CustomToaster } from "@/components/ui/toaster"
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/seo/structured-data"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { FloatingElements } from "@/components/floating-elements"

// Configure Tagesschrift-like font (using Playfair Display as substitute)
const tagesschrift = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-tagesschrift',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | 99 Arts and Crafts - Handcrafted Home Decor',
    default: '99 Arts and Crafts - Handcrafted Mirrors & Home Accessories'
  },
  description:
    "Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories. Premium quality items crafted by skilled artisans using traditional techniques.",
  keywords: 'handcrafted mirrors, home decor, wall art, handmade accessories, artisan crafts, home decoration, custom mirrors, decorative pieces',
  authors: [{ name: '99 Arts and Crafts' }],
  creator: '99 Arts and Crafts',
  publisher: '99 Arts and Crafts',
  robots: 'index, follow',
  generator: "Next.js",
  
  // Open Graph tags for social media sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://99artsandcrafts.com',
    title: '99 Arts and Crafts - Handcrafted Mirrors & Home Accessories',
    description: 'Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories. Premium quality items crafted by skilled artisans.',
    siteName: '99 Arts and Crafts',
    images: [
      {
        url: '/elegant-handcrafted-mirror-with-ornate-frame.png',
        width: 1200,
        height: 630,
        alt: '99 Arts and Crafts - Handcrafted Home Decor',
        type: 'image/png'
      }
    ],
  },
  
  // Twitter Card optimization
  twitter: {
    card: 'summary_large_image',
    site: '@99artsandcrafts',
    creator: '@99artsandcrafts',
    title: '99 Arts and Crafts - Handcrafted Home Decor',
    description: 'Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories. Premium quality handmade items.',
    images: ['/elegant-handcrafted-mirror-with-ornate-frame.png'],
  },
  
  // Additional SEO enhancements
  alternates: {
    canonical: 'https://99artsandcrafts.com',
  },
  
  // App-specific metadata
  applicationName: '99 Arts and Crafts',
  category: 'E-commerce'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${tagesschrift.className} ${GeistSans.variable} ${GeistMono.variable} ${tagesschrift.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthPromptProvider>
                {children}
                <FloatingElements />
              </AuthPromptProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
        <CustomToaster />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  )
}
