import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Home, Eye, Info } from "lucide-react"

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Size Guide</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect size for your space with our comprehensive sizing guide for handcrafted home decor.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mirror Sizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Mirror Sizes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Small Mirrors</h3>
                    <Badge variant="secondary">12"-18"</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Perfect for:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Powder rooms</li>
                    <li>• Gallery walls</li>
                    <li>• Accent pieces</li>
                    <li>• Small bathrooms</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Medium Mirrors</h3>
                    <Badge variant="secondary">20"-30"</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Perfect for:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Entryways</li>
                    <li>• Above consoles</li>
                    <li>• Bedroom walls</li>
                    <li>• Guest bathrooms</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Large Mirrors</h3>
                    <Badge variant="secondary">32"-48"</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Perfect for:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Living rooms</li>
                    <li>• Master bathrooms</li>
                    <li>• Above fireplaces</li>
                    <li>• Statement walls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room-Specific Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Room-Specific Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Living Room</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose mirrors that are 2/3 the width of your furniture piece (sofa, console, etc.)
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Above sofa: 30"-40" wide</li>
                    <li>• Above console: Match console width</li>
                    <li>• Corner placement: 24"-36" diameter</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Bathroom</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mirror should be narrower than the vanity and positioned 5"-10" above the sink
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Single vanity: 24"-30" wide</li>
                    <li>• Double vanity: Two 20"-24" mirrors or one 48"-60" mirror</li>
                    <li>• Powder room: 18"-24" wide</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Bedroom</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Consider both function and style when choosing bedroom mirrors
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Above dresser: 30"-36" wide</li>
                    <li>• Full-length: 48"-60" tall</li>
                    <li>• Accent mirror: 20"-30" diameter</li>
                  </ul>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold mb-2">Entryway</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create a welcoming entrance with appropriately sized mirrors
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Above console table: 24"-36" wide</li>
                    <li>• Standalone: 30"-40" tall</li>
                    <li>• Gallery arrangement: Mix of 12"-24" pieces</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measuring Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Measuring Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Before You Measure</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use a metal measuring tape for accuracy</li>
                    <li>• Measure the wall space, not the furniture</li>
                    <li>• Consider ceiling height and room proportions</li>
                    <li>• Account for light switches and outlets</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Hanging Height</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Standard height: 57"-60" to center of mirror</li>
                    <li>• Above furniture: 6"-8" above the piece</li>
                    <li>• Bathroom: 5"-10" above sink</li>
                    <li>• Adjust for your height and usage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference Size Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left">Mirror Size</th>
                      <th className="border border-border p-3 text-left">Dimensions</th>
                      <th className="border border-border p-3 text-left">Best For</th>
                      <th className="border border-border p-3 text-left">Room Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Small</td>
                      <td className="border border-border p-3">12" - 18"</td>
                      <td className="border border-border p-3">Accent, Gallery walls</td>
                      <td className="border border-border p-3">Any size room</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="border border-border p-3">Medium</td>
                      <td className="border border-border p-3">20" - 30"</td>
                      <td className="border border-border p-3">Functional, Decorative</td>
                      <td className="border border-border p-3">Small to medium rooms</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Large</td>
                      <td className="border border-border p-3">32" - 48"</td>
                      <td className="border border-border p-3">Statement pieces</td>
                      <td className="border border-border p-3">Medium to large rooms</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="border border-border p-3">Extra Large</td>
                      <td className="border border-border p-3">50"+ </td>
                      <td className="border border-border p-3">Dramatic focal points</td>
                      <td className="border border-border p-3">Large rooms only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our design experts are here to help you choose the perfect size for your space.
              </p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Free Design Consultation</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us photos of your space and measurements, and we'll recommend the ideal mirror size and
                  placement.
                </p>
                <p className="text-sm">Email: design@Arts & Crafts.com | Phone: +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
