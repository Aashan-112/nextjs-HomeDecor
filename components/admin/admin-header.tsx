"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Search, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { ReactNode } from "react"

interface AdminHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

interface Notification {
  id: string
  type: 'low_stock' | 'new_order' | 'system'
  title: string
  message: string
  created_at: string
  read: boolean
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as Element
        if (!target.closest('.notifications-dropdown')) {
          setShowNotifications(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  // Fetch notifications function with useCallback to prevent recreation
  const fetchNotifications = useCallback(async () => {
    try {
      console.log('🔔 [ADMIN NOTIFICATIONS] Starting fetch...')
      
      // Use fetch API to call admin endpoint for better RLS handling
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/orders', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }),
        fetch('/api/admin/products', {
          method: 'GET', 
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
      ])

      console.log(`📊 Orders API response: ${ordersResponse.status}, Products API response: ${productsResponse.status}`)

      const notifications: Notification[] = []
      
      // Process orders if API call succeeded
      if (ordersResponse.ok) {
        const allOrders = await ordersResponse.json()
        console.log(`💰 Found ${allOrders?.length || 0} total orders`)
        
        // Filter recent orders (last 24 hours)
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000)
        const recentOrders = allOrders?.filter((order: any) => {
          const orderTime = new Date(order.created_at).getTime()
          return orderTime > cutoffTime
        }) || []
        
        console.log(`🔥 Found ${recentOrders.length} recent orders (last 24 hours)`)
        
        // Add order notifications
        recentOrders.forEach((order: any) => {
          const orderTime = new Date(order.created_at)
          const isVeryRecent = Date.now() - orderTime.getTime() < 2 * 60 * 60 * 1000 // 2 hours
          const notificationId = `order-${order.id}`
          
          notifications.push({
            id: notificationId,
            type: 'new_order',
            title: isVeryRecent ? '🎉 New Order!' : 'Recent Order',
            message: `Order #${order.order_number} - $${parseFloat(order.total_amount || 0).toFixed(2)} (${order.status})`,
            created_at: order.created_at,
            read: readNotifications.has(notificationId)
          })
        })
      } else {
        console.warn('⚠️ Orders API failed, trying direct client...')
        
        // Fallback to direct client
        const supabase = createClient()
        const { data: recentOrders, error: ordersError } = await supabase
          .from('orders')
          .select('id, order_number, created_at, status, total_amount')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10)
        
        console.log(`💰 Fallback orders query:`, { count: recentOrders?.length, error: ordersError })
        
        recentOrders?.forEach(order => {
          const orderTime = new Date(order.created_at)
          const isVeryRecent = Date.now() - orderTime.getTime() < 2 * 60 * 60 * 1000
          const notificationId = `order-${order.id}`
          
          notifications.push({
            id: notificationId,
            type: 'new_order',
            title: isVeryRecent ? '🎉 New Order!' : 'Recent Order',
            message: `Order #${order.order_number} - $${parseFloat(order.total_amount || 0).toFixed(2)} (${order.status})`,
            created_at: order.created_at,
            read: readNotifications.has(notificationId)
          })
        })
      }
      
      // Process products for low stock alerts
      if (productsResponse.ok) {
        const allProducts = await productsResponse.json()
        const lowStockProducts = allProducts?.filter((product: any) => 
          product.is_active && product.stock_quantity < 10
        ) || []
        
        console.log(`📦 Found ${lowStockProducts.length} low stock products`)

        // Add low stock notifications
        lowStockProducts.forEach((product: any) => {
          const notificationId = `stock-${product.id}`
          notifications.push({
            id: notificationId,
            type: 'low_stock',
            title: '⚠️ Low Stock Alert',
            message: `${product.name} has only ${product.stock_quantity} items left`,
            created_at: new Date().toISOString(),
            read: readNotifications.has(notificationId)
          })
        })
      } else {
        console.warn('⚠️ Products API failed, trying direct client for low stock...')
        
        const supabase = createClient()
        const { data: lowStockProducts } = await supabase
          .from('products')
          .select('id, name, stock_quantity')
          .lt('stock_quantity', 10)
          .eq('is_active', true)
          .limit(10)
          
        lowStockProducts?.forEach(product => {
          const notificationId = `stock-${product.id}`
          notifications.push({
            id: notificationId,
            type: 'low_stock',
            title: '⚠️ Low Stock Alert',
            message: `${product.name} has only ${product.stock_quantity} items left`,
            created_at: new Date().toISOString(),
            read: readNotifications.has(notificationId)
          })
        })
      }

      console.log(`✅ [NOTIFICATIONS] Total: ${notifications.length} (Orders: ${notifications.filter(n => n.type === 'new_order').length}, Low Stock: ${notifications.filter(n => n.type === 'low_stock').length})`)
      
      // Sort notifications by creation date (newest first)
      notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setNotifications(notifications)
      setUnreadCount(notifications.filter(n => !n.read).length)
      
      // Log notification update
      if (notifications.length > 0) {
        console.log(`🔔 [BADGE] Showing ${notifications.filter(n => !n.read).length} unread notifications`)
      }
      
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error fetching notifications:', error)
    }
  }, [readNotifications]) // Add readNotifications as dependency

  // Load read notifications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin-notifications-read')
        if (saved) {
          setReadNotifications(new Set(JSON.parse(saved)))
        }
      } catch (error) {
        console.error('Error loading read notifications:', error)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    console.log('🚀 [NOTIFICATIONS] Initial fetch triggered')
    fetchNotifications()
  }, [fetchNotifications])
  
  // Auto-refresh notifications every 30 seconds for faster updates
  useEffect(() => {
    console.log('⏰ [AUTO-REFRESH] Setting up auto-refresh interval')
    
    const interval = setInterval(() => {
      console.log('🔄 [AUTO-REFRESH] Refreshing notifications...')
      fetchNotifications()
    }, 30000) // 30 seconds
    
    return () => {
      console.log('⏹️ [AUTO-REFRESH] Cleaning up interval')
      clearInterval(interval)
    }
  }, [fetchNotifications])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    // Persist to localStorage
    const newReadNotifications = new Set(readNotifications).add(notificationId)
    setReadNotifications(newReadNotifications)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin-notifications-read', JSON.stringify([...newReadNotifications]))
      } catch (error) {
        console.error('Error saving read notifications:', error)
      }
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    
    // Add all current notification IDs to read set
    const allNotificationIds = new Set([...readNotifications, ...notifications.map(n => n.id)])
    setReadNotifications(allNotificationIds)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin-notifications-read', JSON.stringify([...allNotificationIds]))
      } catch (error) {
        console.error('Error saving read notifications:', error)
      }
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {action}
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-10 bg-muted/50" />
          </div>

          {/* Notifications */}
          <div className="relative notifications-dropdown">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50">
                <Card className="w-96 max-h-96 overflow-y-auto shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Notifications</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            console.log('🔄 Manual notification refresh triggered')
                            fetchNotifications()
                          }}
                          title="Refresh notifications"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No new notifications
                      </p>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-2 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                            !notification.read ? 'bg-muted/30 border-primary/20' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-1 ml-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
