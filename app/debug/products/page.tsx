"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugProductsPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/products', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setDebugData(data)
    } catch (error: any) {
      console.error('Debug fetch error:', error)
      setDebugData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testDataSync = async () => {
    try {
      const { getProducts } = await import('@/lib/data/data-sync')
      const products = await getProducts()
      console.log('Direct data-sync products:', products)
      alert(`Found ${products.length} products via data-sync. Check console for details.`)
    } catch (error: any) {
      console.error('Data sync error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>
        <div className="flex gap-4">
          <Button onClick={fetchDebugData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Debug Data'}
          </Button>
          <Button onClick={testDataSync} variant="outline">
            Test Data Sync
          </Button>
        </div>
      </div>

      {debugData && (
        <div className="space-y-6">
          {debugData.error ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{debugData.error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Service Role Query (All Products)</CardTitle>
                  <CardDescription>Direct database access - shows all products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p><strong>Count:</strong> {debugData.debug?.serviceRoleQuery?.allProducts?.count}</p>
                  {debugData.debug?.serviceRoleQuery?.allProducts?.error && (
                    <p className="text-red-600"><strong>Error:</strong> {JSON.stringify(debugData.debug.serviceRoleQuery.allProducts.error)}</p>
                  )}
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugData.debug?.serviceRoleQuery?.allProducts?.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Role Query (Active Products)</CardTitle>
                  <CardDescription>Direct database access - only active products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p><strong>Count:</strong> {debugData.debug?.serviceRoleQuery?.activeProducts?.count}</p>
                  {debugData.debug?.serviceRoleQuery?.activeProducts?.error && (
                    <p className="text-red-600"><strong>Error:</strong> {JSON.stringify(debugData.debug.serviceRoleQuery.activeProducts.error)}</p>
                  )}
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugData.debug?.serviceRoleQuery?.activeProducts?.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Public API Response</CardTitle>
                  <CardDescription>/api/public/products - what customers see</CardDescription>
                </CardHeader>
                <CardContent>
                  {debugData.debug?.publicApi?.error ? (
                    <p className="text-red-600"><strong>Error:</strong> {debugData.debug.publicApi.error}</p>
                  ) : (
                    <p><strong>Count:</strong> {debugData.debug?.publicApi?.data?.length || 0}</p>
                  )}
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugData.debug?.publicApi?.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anonymous Client Query</CardTitle>
                  <CardDescription>Fallback method used by data-sync</CardDescription>
                </CardHeader>
                <CardContent>
                  <p><strong>Count:</strong> {debugData.debug?.anonymousClient?.count}</p>
                  {debugData.debug?.anonymousClient?.error && (
                    <p className="text-red-600"><strong>Error:</strong> {JSON.stringify(debugData.debug.anonymousClient.error)}</p>
                  )}
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugData.debug?.anonymousClient?.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
