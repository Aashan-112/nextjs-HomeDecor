"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DiagnosePage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnose/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnosis()
  }, [])

  if (!results && loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Running Product Diagnosis...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (results?.error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Diagnosis Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{results.error}</p>
            <p className="mt-2 text-sm text-gray-600">{results.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Data Diagnosis</h1>
        <Button onClick={runDiagnosis} disabled={loading}>
          {loading ? 'Running...' : '🔄 Re-run Diagnosis'}
        </Button>
      </div>

      {results && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Summary
                <Badge variant={results.summary?.issues?.some((i: string) => i.includes('❌')) ? 'destructive' : 'default'}>
                  {results.summary?.issues?.length || 0} Issues Found
                </Badge>
              </CardTitle>
              <CardDescription>Overall state of your product data pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{results.summary?.totalProductsInDb || 0}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-green-600">{results.summary?.activeProductsInDb || 0}</div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-purple-600">{results.summary?.productsReturnedByPublicApi || 0}</div>
                  <div className="text-sm text-gray-600">Via Public API</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-orange-600">{results.summary?.productsReturnedByAnonClient || 0}</div>
                  <div className="text-sm text-gray-600">Via Anonymous</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-indigo-600">{results.summary?.categoriesAvailable || 0}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Issues Detected:</h4>
                {results.summary?.issues?.map((issue: string, index: number) => (
                  <div key={index} className={`p-2 rounded text-sm ${
                    issue.includes('❌') ? 'bg-red-100 text-red-800' :
                    issue.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Test Results */}
          <div className="grid gap-4">
            {/* Service Role All Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔑 Service Role Query (All Products)
                  <Badge variant={results.tests?.serviceRoleAll?.success ? 'default' : 'destructive'}>
                    {results.tests?.serviceRoleAll?.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
                <CardDescription>Direct database access - should show ALL products</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Count:</strong> {results.tests?.serviceRoleAll?.count || 0}</p>
                {results.tests?.serviceRoleAll?.error && (
                  <p className="text-red-600"><strong>Error:</strong> {results.tests.serviceRoleAll.error}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">Show products</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.tests?.serviceRoleAll?.products || [], null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            {/* Service Role Active Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ Service Role Query (Active Products)
                  <Badge variant={results.tests?.serviceRoleActive?.success ? 'default' : 'destructive'}>
                    {results.tests?.serviceRoleActive?.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
                <CardDescription>Direct database access - only active products</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Count:</strong> {results.tests?.serviceRoleActive?.count || 0}</p>
                {results.tests?.serviceRoleActive?.error && (
                  <p className="text-red-600"><strong>Error:</strong> {results.tests.serviceRoleActive.error}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">Show products</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.tests?.serviceRoleActive?.products || [], null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            {/* Public API Call */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 Public API Test
                  <Badge variant={results.tests?.internalApiCall?.success ? 'default' : 'destructive'}>
                    {results.tests?.internalApiCall?.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
                <CardDescription>What the /api/public/products endpoint returns</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Count:</strong> {results.tests?.internalApiCall?.count || 0}</p>
                {results.tests?.internalApiCall?.error && (
                  <p className="text-red-600"><strong>Error:</strong> {results.tests.internalApiCall.error}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">Show products</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.tests?.internalApiCall?.latestProducts || [], null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            {/* Anonymous Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👤 Anonymous Client Test
                  <Badge variant={results.tests?.anonymousClient?.success ? 'default' : 'destructive'}>
                    {results.tests?.anonymousClient?.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
                <CardDescription>What customers see (RLS policies applied)</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Count:</strong> {results.tests?.anonymousClient?.count || 0}</p>
                {results.tests?.anonymousClient?.error && (
                  <p className="text-red-600"><strong>Error:</strong> {results.tests.anonymousClient.error}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">Show products</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.tests?.anonymousClient?.products || [], null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
