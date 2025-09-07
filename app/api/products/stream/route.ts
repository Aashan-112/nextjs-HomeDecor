import { NextRequest } from 'next/server'

// In-memory store to track connected clients
const clients = new Set<ReadableStreamDefaultController>()

// Simple event emitter for product updates
class ProductEventEmitter {
  private static instance: ProductEventEmitter
  private listeners: ((data: any) => void)[] = []

  static getInstance() {
    if (!ProductEventEmitter.instance) {
      ProductEventEmitter.instance = new ProductEventEmitter()
    }
    return ProductEventEmitter.instance
  }

  emit(event: string, data: any) {
    this.listeners.forEach(listener => listener({ event, data }))
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ 
        event: 'connected', 
        message: 'Connected to product updates stream',
        timestamp: new Date().toISOString() 
      })}\n\n`)

      // Subscribe to product updates
      const emitter = ProductEventEmitter.getInstance()
      const unsubscribe = emitter.subscribe((data) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
        } catch (error) {
          console.error('Error sending SSE data:', error)
        }
      })

      // Send periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ 
            event: 'heartbeat', 
            timestamp: new Date().toISOString() 
          })}\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
        }
      }, 10000) // Every 10 seconds for better connection stability

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clients.delete(controller)
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch (error) {
          console.log('Controller already closed')
        }
      })
    },
    cancel() {
      clients.delete(this as any)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

// Export the emitter for use in other API routes
export { ProductEventEmitter }
