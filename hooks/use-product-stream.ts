"use client"

import { useEffect, useRef, useState } from 'react'

interface ProductStreamEvent {
  event: string
  data?: any
  message?: string
  timestamp?: string
}

interface UseProductStreamOptions {
  onNewProduct?: (product: any) => void
  onProductUpdate?: (product: any) => void
  onConnected?: () => void
  onError?: (error: Error) => void
  autoReconnect?: boolean
}

export function useProductStream(options: UseProductStreamOptions = {}) {
  const {
    onNewProduct,
    onProductUpdate,
    onConnected,
    onError,
    autoReconnect = true
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const connect = () => {
    try {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      console.log('🔗 Connecting to product stream...')
      const eventSource = new EventSource('/api/products/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ Connected to product stream')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
        onConnected?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const data: ProductStreamEvent = JSON.parse(event.data)
          
          console.log('📡 Received SSE event:', data.event, data)

          switch (data.event) {
            case 'connected':
              console.log('🎉 Stream connection established')
              break
            
            case 'heartbeat':
              // Silent heartbeat - just log for debugging
              console.log('💓 Heartbeat received')
              break
            
            case 'new_product':
              console.log('🆕 New product received via SSE:', data.data)
              onNewProduct?.(data.data)
              break
            
            case 'product_updated':
              console.log('🔄 Product update received via SSE:', data.data)
              onProductUpdate?.(data.data)
              break
            
            default:
              console.log('📨 Unknown SSE event:', data.event, data)
          }
        } catch (error) {
          console.error('❌ Error parsing SSE data:', error, event.data)
        }
      }

      eventSource.onerror = (event) => {
        console.error('❌ SSE connection error:', event)
        setIsConnected(false)
        
        const error = new Error('SSE connection failed')
        setConnectionError(error.message)
        onError?.(error)

        if (autoReconnect && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff, max 30s
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }

    } catch (error) {
      console.error('❌ Failed to create EventSource:', error)
      onError?.(error as Error)
    }
  }

  const disconnect = () => {
    console.log('🔌 Disconnecting from product stream')
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    setConnectionError(null)
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, []) // Connect once on mount

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    reconnectAttempts: reconnectAttemptsRef.current
  }
}
