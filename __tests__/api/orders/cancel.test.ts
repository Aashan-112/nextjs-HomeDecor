import { NextRequest } from 'next/server'
import { PATCH } from '@/app/api/orders/[id]/cancel/route'
import { createClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/auth/user-auth')

const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  update: jest.fn()
}

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('/api/orders/[id]/cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  describe('PATCH /api/orders/[id]/cancel', () => {
    it('should successfully cancel a pending order', async () => {
      const mockOrder = {
        id: '123',
        status: 'pending',
        user_id: 'user-123',
        total_amount: 5000,
        payment_method: 'cod'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      }).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders/123/cancel', {
        method: 'PATCH',
        headers: {
          'user-id': 'user-123'
        }
      })

      const response = await PATCH(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Order cancelled successfully')
    })

    it('should reject cancellation of processing order', async () => {
      const mockOrder = {
        id: '123',
        status: 'processing',
        user_id: 'user-123',
        total_amount: 5000
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders/123/cancel', {
        method: 'PATCH',
        headers: {
          'user-id': 'user-123'
        }
      })

      const response = await PATCH(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Cannot cancel order in processing status')
    })

    it('should reject cancellation if order not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Order not found' } })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders/123/cancel', {
        method: 'PATCH',
        headers: {
          'user-id': 'user-123'
        }
      })

      const response = await PATCH(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Order not found')
    })

    it('should reject unauthorized cancellation attempt', async () => {
      const mockOrder = {
        id: '123',
        status: 'pending',
        user_id: 'different-user',
        total_amount: 5000
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders/123/cancel', {
        method: 'PATCH',
        headers: {
          'user-id': 'user-123'
        }
      })

      const response = await PATCH(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized to cancel this order')
    })

    it('should reject cancellation if already cancelled', async () => {
      const mockOrder = {
        id: '123',
        status: 'cancelled',
        user_id: 'user-123',
        total_amount: 5000
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders/123/cancel', {
        method: 'PATCH',
        headers: {
          'user-id': 'user-123'
        }
      })

      const response = await PATCH(request, { params: { id: '123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Order is already cancelled')
    })
  })
})
