"use client"

import { AdminHeader } from "@/components/admin/admin-header"
import { DataSyncButton } from "@/components/data-sync-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, FEATURED_PRODUCTS, ALL_PRODUCTS } from "@/lib/data/products-data"
import { Database, Package, Tag, Star } from "lucide-react"

export default function DataManagementPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Data Management"
        description="Manage product data and synchronization"
        action={<DataSyncButton />}
      />

      <main className="flex-1 p-6">
        <div className="max-w-6xl space-y-8">
          {/* Quick sync control (in addition to header action) */}
          <div className="flex items-center justify-end">
            <DataSyncButton />
          </div>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ALL_PRODUCTS.length}</div>
                <p className="text-xs text-muted-foreground">In data file</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FEATURED_PRODUCTS.length}</div>
                <p className="text-xs text-muted-foreground">Highlighted items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{CATEGORIES.length}</div>
                <p className="text-xs text-muted-foreground">Product categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Source</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Hybrid</div>
                <p className="text-xs text-muted-foreground">File + Database</p>
              </CardContent>
            </Card>
          </div>

          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Product categories defined in the data file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <Badge variant="outline">{Math.ceil(ALL_PRODUCTS.length / CATEGORIES.length)} products</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Products Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Products marked as featured in the data file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {FEATURED_PRODUCTS.map((product, index) => (
                  <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{product.sku}</Badge>
                        <Badge variant="secondary">${product.price}</Badge>
                        {product.compare_at_price && (
                          <Badge variant="destructive">
                            {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                            OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p className="font-medium">{product.stock_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management Info */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Understanding the hybrid data management system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data File Management</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Products defined in <code>lib/data/products-data.ts</code>
                    </li>
                    <li>• Easy to edit and version control</li>
                    <li>• Immediate updates without database changes</li>
                    <li>• Fallback when database is unavailable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Database Integration</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sync data file to database for performance</li>
                    <li>• User-generated content (reviews, cart items)</li>
                    <li>• Real-time inventory management</li>
                    <li>• Advanced querying and filtering</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
