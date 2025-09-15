'use client'

import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { BreadcrumbStructuredData } from './structured-data'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbItemType {
  name: string
  url: string
  current?: boolean
}

interface SEOBreadcrumbProps {
  items: BreadcrumbItemType[]
  className?: string
  showHome?: boolean
}

export function SEOBreadcrumb({ items, className, showHome = true }: SEOBreadcrumbProps) {
  const allItems = showHome ? [{ name: 'Home', url: '/' }, ...items] : items

  const structuredDataItems = allItems.map(item => ({
    name: item.name,
    url: item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://99artsandcrafts.com'}${item.url}`
  }))

  return (
    <>
      <BreadcrumbStructuredData items={structuredDataItems} />
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {allItems.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.current || index === allItems.length - 1 ? (
                  <BreadcrumbPage>
                    {index === 0 && showHome ? (
                      <span className="flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        {item.name}
                      </span>
                    ) : (
                      item.name
                    )}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.url} aria-label={`Go to ${item.name}`}>
                      {index === 0 && showHome ? (
                        <span className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {item.name}
                        </span>
                      ) : (
                        item.name
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < allItems.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}

// Convenient breadcrumb generators for common page types
export function ProductBreadcrumb({ 
  productName, 
  categoryName, 
  categorySlug,
  className 
}: { 
  productName: string
  categoryName?: string
  categorySlug?: string
  className?: string
}) {
  const items: BreadcrumbItemType[] = []
  
  items.push({ name: 'Products', url: '/products' })
  
  if (categoryName && categorySlug) {
    items.push({ name: categoryName, url: `/categories/${categorySlug}` })
  }
  
  items.push({ name: productName, url: '#', current: true })
  
  return <SEOBreadcrumb items={items} className={className} />
}

export function CategoryBreadcrumb({ 
  categoryName, 
  parentCategoryName, 
  parentCategorySlug,
  className 
}: { 
  categoryName: string
  parentCategoryName?: string
  parentCategorySlug?: string
  className?: string
}) {
  const items: BreadcrumbItemType[] = []
  
  items.push({ name: 'Products', url: '/products' })
  
  if (parentCategoryName && parentCategorySlug) {
    items.push({ name: parentCategoryName, url: `/categories/${parentCategorySlug}` })
  }
  
  items.push({ name: categoryName, url: '#', current: true })
  
  return <SEOBreadcrumb items={items} className={className} />
}

export function SearchBreadcrumb({ 
  searchQuery,
  className 
}: { 
  searchQuery: string
  className?: string 
}) {
  const items: BreadcrumbItemType[] = [
    { name: 'Search Results', url: '/search' },
    { name: `"${searchQuery}"`, url: '#', current: true }
  ]
  
  return <SEOBreadcrumb items={items} className={className} />
}

export function CheckoutBreadcrumb({ 
  step,
  className 
}: { 
  step: 'cart' | 'checkout' | 'payment' | 'confirmation'
  className?: string 
}) {
  const stepNames = {
    cart: 'Shopping Cart',
    checkout: 'Checkout',
    payment: 'Payment',
    confirmation: 'Order Confirmation'
  }
  
  const items: BreadcrumbItemType[] = [
    { name: 'Shopping Cart', url: '/cart' },
  ]
  
  if (step !== 'cart') {
    items.push({ name: 'Checkout', url: step === 'checkout' ? '#' : '/checkout' })
  }
  
  if (step === 'payment' || step === 'confirmation') {
    items.push({ name: 'Payment', url: step === 'payment' ? '#' : '/checkout/payment' })
  }
  
  if (step === 'confirmation') {
    items.push({ name: 'Order Confirmation', url: '#' })
  }
  
  // Mark current step
  const currentStepIndex = items.findIndex(item => 
    item.name.toLowerCase().includes(stepNames[step].toLowerCase())
  )
  if (currentStepIndex !== -1) {
    items[currentStepIndex].current = true
  }
  
  return <SEOBreadcrumb items={items} className={className} />
}
