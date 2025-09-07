import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Shield, Clock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Returns & Exchanges</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We want you to love your handcrafted items. If you're not completely satisfied, we're here to help.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Return Policy Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Return Policy Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">30-Day Window</h3>
                  <p className="text-sm text-muted-foreground">Return items within 30 days of delivery</p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Original Condition</h3>
                  <p className="text-sm text-muted-foreground">Items must be unused and in original packaging</p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Easy Process</h3>
                  <p className="text-sm text-muted-foreground">Simple online return initiation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Can Be Returned */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Standard handcrafted items
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mirrors and wall decor
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Home accessories
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Defective or damaged items
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Items not as described
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Non-Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Custom or personalized items
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Items damaged by misuse
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Items without original packaging
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Items returned after 30 days
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Final sale items
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Return Process */}
          <Card>
            <CardHeader>
              <CardTitle>How to Return an Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Initiate Return</h3>
                    <p className="text-sm text-muted-foreground">
                      Log into your account and go to "Order History" or contact customer service
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Get Return Label</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll email you a prepaid return shipping label within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Package Item</h3>
                    <p className="text-sm text-muted-foreground">
                      Securely package the item in its original packaging with all accessories
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ship Return</h3>
                    <p className="text-sm text-muted-foreground">Drop off at any UPS location or schedule a pickup</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Information */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Processing Time</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 2-3 business days after we receive your return</li>
                      <li>• Refunds processed to original payment method</li>
                      <li>• Bank processing may take 3-5 additional days</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Refund Amount</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Full item price refunded</li>
                      <li>• Original shipping costs non-refundable</li>
                      <li>• Return shipping is free for defective items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle>Exchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We currently don't offer direct exchanges. To exchange an item, please return the original item for a
                refund and place a new order for the desired item.
              </p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  Contact us before returning if you want to exchange for a different size or color. We may be able to
                  help expedite the process.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Returns */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help with Returns?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our customer service team is here to help with any return questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/contact">Contact Customer Service</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account/orders">View Your Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
