import { NextRequest } from 'next/server'
import { ProductEventEmitter } from '@/lib/product-events'

// In-memory store to track connected clients
const clients = new Set<ReadableStreamDefaultController>()

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

// The emitter instance can be accessed via ProductEventEmitter.getInstance()
// from other modules that import this file
