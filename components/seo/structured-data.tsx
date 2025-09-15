'use client'

interface OrganizationStructuredDataProps {
  className?: string
}

export function OrganizationStructuredData({ className }: OrganizationStructuredDataProps) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "99 Arts and Crafts",
    "description": "Premium handcrafted home decor including mirrors, wall art, and decorative accessories made by skilled artisans",
    "url": "https://99artsandcrafts.com",
    "logo": "https://99artsandcrafts.com/logo.png",
    "image": "https://99artsandcrafts.com/elegant-handcrafted-mirror-with-ornate-frame.png",
    "foundingDate": "2020",
    "founder": {
      "@type": "Person",
      "name": "99 Arts and Crafts Founder"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      "email": "contact@99artsandcrafts.com",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "CA",
      "addressLocality": "Los Angeles"
    },
    "sameAs": [
      "https://www.facebook.com/99artsandcrafts",
      "https://www.instagram.com/99artsandcrafts",
      "https://www.pinterest.com/99artsandcrafts"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      className={className}
    />
  )
}

interface WebsiteStructuredDataProps {
  className?: string
}

export function WebsiteStructuredData({ className }: WebsiteStructuredDataProps) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "99 Arts and Crafts",
    "description": "Discover unique handcrafted home decor pieces including mirrors, wall art, and accessories",
    "url": "https://99artsandcrafts.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://99artsandcrafts.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      className={className}
    />
  )
}

interface ProductStructuredDataProps {
  product: {
    name: string
    description: string
    image: string
    price: number
    currency?: string
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
    condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
    brand?: string
    category?: string
    sku?: string
    gtin?: string
  }
  className?: string
}

export function ProductStructuredData({ product, className }: ProductStructuredDataProps) {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "99 Arts and Crafts"
    },
    "category": product.category || "Home Decor",
    "sku": product.sku,
    "gtin": product.gtin,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": product.currency || "USD",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "itemCondition": `https://schema.org/${product.condition || 'NewCondition'}`,
      "seller": {
        "@type": "Organization",
        "name": "99 Arts and Crafts"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
      className={className}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
  className?: string
}

export function BreadcrumbStructuredData({ items, className }: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      className={className}
    />
  )
}

interface ReviewStructuredDataProps {
  reviews: Array<{
    author: string
    rating: number
    reviewBody: string
    datePublished: string
  }>
  product: {
    name: string
    image: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  className?: string
}

export function ReviewStructuredData({ reviews, product, aggregateRating, className }: ReviewStructuredDataProps) {
  const reviewData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished
    })),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": "5"
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData) }}
      className={className}
    />
  )
}

// FAQ Structured Data for better search results
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
  className?: string
}

export function FAQStructuredData({ faqs, className }: FAQStructuredDataProps) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      className={className}
    />
  )
}
