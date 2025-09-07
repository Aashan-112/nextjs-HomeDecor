import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, MapPin, Package, Shield } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shipping Information</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We carefully package and ship your handcrafted items to ensure they arrive safely at your door.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Shipping Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Standard Shipping</h3>
                    <Badge variant="secondary">$9.99</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">5-7 business days</p>
                  <p className="text-sm">
                    Perfect for regular orders. Items are carefully packaged with protective materials.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Express Shipping</h3>
                    <Badge variant="secondary">$19.99</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">2-3 business days</p>
                  <p className="text-sm">Faster delivery with priority handling and tracking updates.</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Overnight Shipping</h3>
                    <Badge variant="secondary">$39.99</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">1 business day</p>
                  <p className="text-sm">Next-day delivery for urgent orders (order by 2PM EST).</p>
                </div>

                <div className="border rounded-lg p-4 bg-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Free Shipping</h3>
                    <Badge>Free</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">5-7 business days</p>
                  <p className="text-sm">On orders over $150. Same careful packaging as standard shipping.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">In-Stock Items</h3>
                    <p className="text-sm text-muted-foreground">1-2 business days processing time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Made-to-Order Items</h3>
                    <p className="text-sm text-muted-foreground">3-5 business days processing time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Custom Orders</h3>
                    <p className="text-sm text-muted-foreground">7-14 business days processing time</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Domestic Shipping (US)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All 50 states including Alaska and Hawaii</li>
                    <li>• Puerto Rico and US territories</li>
                    <li>• PO Boxes and APO/FPO addresses</li>
                    <li>• Signature required for orders over $500</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">International Shipping</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Canada: 7-14 business days</li>
                    <li>• Europe: 10-21 business days</li>
                    <li>• Australia: 14-28 business days</li>
                    <li>• Other countries: Contact us for rates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Packaging & Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Each handcrafted item is carefully packaged to ensure it arrives in perfect condition:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom-sized boxes to prevent movement during transit</li>
                  <li>• Protective bubble wrap and foam padding</li>
                  <li>• Fragile items receive extra cushioning and "FRAGILE" labels</li>
                  <li>• Eco-friendly packaging materials when possible</li>
                  <li>• Insurance included on all orders over $100</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Once your order ships, you'll receive a tracking number via email. You can also track your order status
                in your account dashboard.
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Need help with your shipment?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our customer service team at support@Arts & Crafts.com or call +1 (555) 123-4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
