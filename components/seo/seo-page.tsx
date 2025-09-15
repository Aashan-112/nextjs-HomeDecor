'use client'

import { BreadcrumbStructuredData } from './structured-data'
import Head from 'next/head'

interface SEOPageProps {
  children: React.ReactNode
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  canonical?: string
  noIndex?: boolean
  structuredData?: object
}

export function SEOPage({
  children,
  title,
  description,
  keywords,
  ogImage,
  breadcrumbs,
  canonical,
  noIndex = false,
  structuredData
}: SEOPageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://99artsandcrafts.com'
  const fullTitle = title ? `${title} | 99 Arts and Crafts` : '99 Arts and Crafts - Handcrafted Home Decor'
  const fullDescription = (description ?? 'Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories.') as string;
  const imageUrl = ogImage || '/elegant-handcrafted-mirror-with-ornate-frame.png'
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={fullDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        
        {/* Robots */}
        <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
        
        {/* Canonical URL */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={fullDescription} />
        <meta property="og:image" content={`${baseUrl}${imageUrl}`} />
        <meta property="og:url" content={canonicalUrl || baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="99 Arts and Crafts" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={fullDescription} />
        <meta name="twitter:image" content={`${baseUrl}${imageUrl}`} />
        <meta name="twitter:site" content="@99artsandcrafts" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="99 Arts and Crafts" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbStructuredData items={breadcrumbs} />
      )}
      
      {children}
    </>
  )
}

// Pre-configured SEO components for common page types
export function ProductPageSEO({
  product,
  children,
  breadcrumbs
}: {
  product: {
    name: string
    description: string
    price: number
    image: string
    category?: string
  }
  children: React.ReactNode
  breadcrumbs?: Array<{ name: string; url: string }>
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }

  return (
    <SEOPage
      title={product.name}
      description={product.description}
      keywords={`${product.name}, handcrafted, home decor, ${product.category || ''}`}
      ogImage={product.image}
      breadcrumbs={breadcrumbs}
      structuredData={structuredData}
    >
      {children}
    </SEOPage>
  )
}

export function CategoryPageSEO({
  category,
  children,
  breadcrumbs
}: {
  category: {
    name: string
    description: string
    image?: string
  }
  children: React.ReactNode
  breadcrumbs?: Array<{ name: string; url: string }>
}) {
  return (
    <SEOPage
      title={`${category.name} - Handcrafted Home Decor`}
      description={category.description}
      keywords={`${category.name}, handcrafted, home decor, artisan made`}
      ogImage={category.image}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </SEOPage>
  )
}
