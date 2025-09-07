"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Store, Mail, Shield, Database } from "lucide-react"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Arts & Crafts Home Decor",
    storeDescription: "Handcrafted mirrors and home accessories",
    storeEmail: "hello@Arts & Crafts.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Craft Street, Arts & Crafts City, AC 12345",
    currency: "USD",
    taxRate: "8.0",
  })

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    orderUpdates: true,
    lowStockAlerts: true,
    customerNotifications: true,
    marketingEmails: false,
  })

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowGuestCheckout: true,
    requireEmailVerification: true,
    enableReviews: true,
    enableWishlist: true,
  })

  const handleSaveStoreSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual save functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Store settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save store settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmailSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual save functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Email settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save email settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual save functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("System settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save system settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Settings" description="Configure your store settings" />

      <main className="flex-1 p-6">
        <div className="max-w-4xl space-y-8">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle>Store Information</CardTitle>
              </div>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                  className="w-32"
                />
              </div>

              <Button onClick={handleSaveStoreSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Store Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="orderConfirmation">Order Confirmation</Label>
                    <p className="text-sm text-muted-foreground">Send confirmation emails to customers</p>
                  </div>
                  <Switch
                    id="orderConfirmation"
                    checked={emailSettings.orderConfirmation}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderConfirmation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="orderUpdates">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">Send shipping and delivery updates</p>
                  </div>
                  <Switch
                    id="orderUpdates"
                    checked={emailSettings.orderUpdates}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when products are running low</p>
                  </div>
                  <Switch
                    id="lowStockAlerts"
                    checked={emailSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, lowStockAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="customerNotifications">Customer Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send account-related emails to customers</p>
                  </div>
                  <Switch
                    id="customerNotifications"
                    checked={emailSettings.customerNotifications}
                    onCheckedChange={(checked) =>
                      setEmailSettings({ ...emailSettings, customerNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Send promotional and marketing emails</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={emailSettings.marketingEmails}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, marketingEmails: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveEmailSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Email Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>System Settings</CardTitle>
              </div>
              <CardDescription>Configure system behavior and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable the store for maintenance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                    />
                    {systemSettings.maintenanceMode && <Badge variant="destructive">Active</Badge>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowGuestCheckout">Guest Checkout</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to checkout without creating an account
                    </p>
                  </div>
                  <Switch
                    id="allowGuestCheckout"
                    checked={systemSettings.allowGuestCheckout}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowGuestCheckout: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require customers to verify their email address</p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={systemSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, requireEmailVerification: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableReviews">Product Reviews</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to leave product reviews</p>
                  </div>
                  <Switch
                    id="enableReviews"
                    checked={systemSettings.enableReviews}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableReviews: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableWishlist">Wishlist Feature</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to save products to wishlist</p>
                  </div>
                  <Switch
                    id="enableWishlist"
                    checked={systemSettings.enableWishlist}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableWishlist: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings} disabled={loading}>
                {loading ? "Saving..." : "Save System Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>System Information</CardTitle>
              </div>
              <CardDescription>Current system status and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Application Version</Label>
                  <p className="text-foreground">v1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Database Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Connected</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Last Backup</Label>
                  <p className="text-foreground">Today at 3:00 AM</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Storage Used</Label>
                  <p className="text-foreground">2.4 GB / 10 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
