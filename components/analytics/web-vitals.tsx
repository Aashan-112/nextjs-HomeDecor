'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

// Send vitals to analytics service
function sendToAnalytics(metric: any) {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }

  // You can also send to other analytics services here
  console.log('Web Vital:', metric.name, metric.value)
}

export function WebVitals() {
  useEffect(() => {
    try {
    // Measure Core Web Vitals
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics)
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    } catch (error) {
      console.warn('Web Vitals measurement failed:', error)
    }
  }, [])

  return null // This component doesn't render anything
}

// Custom hook for using Web Vitals data in components
export function useWebVitals() {
  useEffect(() => {
    const handleMetric = (metric: any) => {
      sendToAnalytics(metric)
    }

    onCLS(handleMetric)
    onINP(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  }, [])
}

// Performance observer for additional metrics
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Monitor resource loading times
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming
          
          // Track page load metrics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_load_time', {
              event_category: 'Performance',
              value: Math.round(navigationEntry.loadEventEnd - navigationEntry.loadEventStart),
              non_interaction: true,
            })

            window.gtag('event', 'dom_content_loaded', {
              event_category: 'Performance',
              value: Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart),
              non_interaction: true,
            })
          }
        }

        // Monitor large images and resources
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Alert for slow loading resources (>3s)
          if (resourceEntry.duration > 3000) {
            console.warn(`Slow resource detected: ${resourceEntry.name} took ${resourceEntry.duration}ms`)
            
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'slow_resource', {
                event_category: 'Performance',
                event_label: resourceEntry.name,
                value: Math.round(resourceEntry.duration),
                non_interaction: true,
              })
            }
          }
        }
      }
    })

    // Observe navigation and resource timing
    try {
      observer.observe({ type: 'navigation', buffered: true })
      observer.observe({ type: 'resource', buffered: true })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    return () => observer.disconnect()
  }, [])

  return null
}
