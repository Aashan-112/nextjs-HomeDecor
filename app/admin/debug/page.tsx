"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [productsData, setProductsData] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testProductsAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing products API...')
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`${response.status}: ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Products data:', data)
      setProductsData(data)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDashboardAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing dashboard API...')
      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`${response.status}: ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Dashboard data:', data)
      setDashboardData(data)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin API Debug</h1>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex gap-4">
        <Button 
          onClick={testProductsAPI}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Testing...' : 'Test Products API'}
        </Button>
        
        <Button 
          onClick={testDashboardAPI}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Testing...' : 'Test Dashboard API'}
        </Button>
      </div>
      
      {productsData && (
        <Card>
          <CardHeader>
            <CardTitle>Products API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Products count:</strong> {productsData?.length || 0}</p>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Raw Data</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(productsData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
      
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Total Products:</strong> {dashboardData.totalProducts}
              </div>
              <div>
                <strong>Total Orders:</strong> {dashboardData.totalOrders}
              </div>
              <div>
                <strong>Total Customers:</strong> {dashboardData.totalCustomers}
              </div>
              <div>
                <strong>Total Revenue:</strong> ${dashboardData.totalRevenue?.toFixed(2) || '0.00'}
              </div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Raw Data</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(dashboardData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
