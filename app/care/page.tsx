import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Droplets, Sun, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default function CarePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Care Instructions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keep your handcrafted pieces looking beautiful for years to come with proper care and maintenance.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* General Care */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                General Care Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Do's
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Dust regularly with a soft, dry cloth</li>
                    <li>• Clean gently with appropriate materials</li>
                    <li>• Handle with clean, dry hands</li>
                    <li>• Store in a dry, stable environment</li>
                    <li>• Use coasters and protective pads</li>
                    <li>• Follow material-specific instructions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Don'ts
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Never use harsh chemicals or abrasives</li>
                    <li>• Avoid excessive moisture or humidity</li>
                    <li>• Don't place in direct sunlight for extended periods</li>
                    <li>• Never use rough or dirty cleaning cloths</li>
                    <li>• Avoid extreme temperature changes</li>
                    <li>• Don't ignore signs of wear or damage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mirror Care */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Mirror Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Daily Cleaning</h3>
                  <p className="text-sm text-muted-foreground mb-2">For regular maintenance and streak-free shine</p>
                  <ul className="text-sm space-y-1">
                    <li>• Use a microfiber cloth or lint-free paper towel</li>
                    <li>• Spray glass cleaner on cloth, not directly on mirror</li>
                    <li>• Wipe in circular motions, then finish with vertical strokes</li>
                    <li>• Dry immediately to prevent water spots</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Deep Cleaning</h3>
                  <p className="text-sm text-muted-foreground mb-2">For stubborn spots and thorough cleaning</p>
                  <ul className="text-sm space-y-1">
                    <li>• Mix equal parts white vinegar and water</li>
                    <li>• Apply with a soft cloth, avoiding the frame</li>
                    <li>• For tough spots, let solution sit for 30 seconds</li>
                    <li>• Rinse with clean water and dry thoroughly</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Frame Care</h3>
                  <p className="text-sm text-muted-foreground mb-2">Protect and maintain decorative frames</p>
                  <ul className="text-sm space-y-1">
                    <li>• Dust weekly with a soft brush or cloth</li>
                    <li>• Use appropriate cleaner for frame material</li>
                    <li>• Avoid getting cleaning products on the mirror surface</li>
                    <li>• Check mounting hardware periodically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material-Specific Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wood Care</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Natural Wood
                    </Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Dust with microfiber cloth weekly</li>
                      <li>• Use wood polish monthly</li>
                      <li>• Avoid water and harsh chemicals</li>
                      <li>• Keep away from heat sources</li>
                    </ul>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Painted Wood
                    </Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Clean with damp cloth only</li>
                      <li>• Dry immediately after cleaning</li>
                      <li>• Touch up scratches promptly</li>
                      <li>• Avoid abrasive cleaners</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metal Care</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Brass & Bronze
                    </Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Polish with brass cleaner monthly</li>
                      <li>• Buff with soft cloth after cleaning</li>
                      <li>• Remove tarnish promptly</li>
                      <li>• Apply protective wax if desired</li>
                    </ul>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Iron & Steel
                    </Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Wipe dry after any moisture exposure</li>
                      <li>• Apply rust preventive if needed</li>
                      <li>• Use appropriate metal polish</li>
                      <li>• Check for rust spots regularly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Considerations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Environmental Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Droplets className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Humidity Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain 30-50% humidity to prevent warping and cracking
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Sun className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Light Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Avoid direct sunlight to prevent fading and material degradation
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Temperature Stability</h3>
                  <p className="text-sm text-muted-foreground">Keep in stable temperatures between 60-75°F</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Water Spots on Mirror</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cause:</strong> Hard water or improper drying
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Clean with vinegar solution, rinse with distilled water, and dry
                    immediately
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Frame Loosening</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cause:</strong> Temperature changes or settling
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Tighten screws gently, check mounting hardware, contact us if persistent
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Surface Scratches</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cause:</strong> Improper cleaning or rough handling
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Minor scratches may be polished out; contact us for repair options
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Care */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Care Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For valuable or delicate pieces, consider professional cleaning and maintenance services.
              </p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">We Offer:</p>
                <ul className="text-sm space-y-1">
                  <li>• Professional cleaning and restoration</li>
                  <li>• Frame repair and refinishing</li>
                  <li>• Mirror resilvering services</li>
                  <li>• Protective coating application</li>
                </ul>
                <p className="text-sm mt-3">
                  Contact us at care@Arts & Crafts.com or +1 (555) 123-4567 for more information.
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
