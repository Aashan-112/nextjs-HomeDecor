'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface GoogleAnalyticsProps {
  ga_id: string
}

export function GoogleAnalytics({ ga_id }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!ga_id || !window.gtag) return

    const url = pathname + searchParams.toString()
    
    window.gtag('config', ga_id, {
      page_location: url,
      page_title: document.title,
    })
  }, [pathname, searchParams, ga_id])

  if (!ga_id) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga_id}', {
              page_location: window.location.href,
              page_title: document.title,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}

// Enhanced event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters?.category || 'general',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters
    })
  }
}

export const trackPurchase = (transactionId: string, value: number, currency = 'USD', items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  }
}

export const trackViewItem = (itemId: string, itemName: string, category: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: value,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          category: category,
          quantity: 1,
          price: value
        }
      ]
    })
  }
}

export const trackAddToCart = (itemId: string, itemName: string, category: string, value: number, quantity = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: value,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          category: category,
          quantity: quantity,
          price: value
        }
      ]
    })
  }
}

export const trackBeginCheckout = (value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: value,
      items: items
    })
  }
}

export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm
    })
  }
}

// Type declarations for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
