"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Search, Mail, User, ShoppingBag } from "lucide-react"
import type { Profile } from "@/lib/types"

interface CustomerWithStats extends Profile {
  email?: string
  total_orders: number
  total_spent: number
  last_order_date?: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = createClient()

      try {
        // Get all profiles with customer role
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .neq("role", "admin")
          .order("created_at", { ascending: false })

        if (profilesError) throw profilesError

        // Get user emails and order stats
        const customersWithStats = await Promise.all(
          profiles.map(async (profile) => {
            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id)

            // Get order statistics
            const { data: orders } = await supabase
              .from("orders")
              .select("total_amount, created_at")
              .eq("user_id", profile.id)

            const totalOrders = orders?.length || 0
            const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
            const lastOrderDate = orders?.[0]?.created_at

            return {
              ...profile,
              email: userData?.user?.email,
              total_orders: totalOrders,
              total_spent: totalSpent,
              last_order_date: lastOrderDate,
            }
          }),
        )

        setCustomers(customersWithStats)
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      customer.first_name?.toLowerCase().includes(searchLower) ||
      customer.last_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Customers" description="Manage your customers" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Customers" description="Manage your customers" />

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.filter((c) => c.total_orders > 0).length}</div>
                <p className="text-xs text-muted-foreground">Have placed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {customers.reduce((sum, c) => sum + c.total_spent, 0) /
                    Math.max(customers.filter((c) => c.total_orders > 0).length, 1) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Per customer</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>

          {/* Customers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {customer.first_name || customer.last_name
                              ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                              : "No name provided"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email || "No email"}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone || "No phone"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.total_orders}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${customer.total_spent.toFixed(2)}</TableCell>
                      <TableCell>
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.total_orders > 0 ? "default" : "secondary"}>
                          {customer.total_orders > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No customers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
