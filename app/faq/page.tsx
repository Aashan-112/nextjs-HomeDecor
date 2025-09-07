"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Truck, RotateCcw } from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    id: "orders",
    name: "Orders & Payment",
    icon: CreditCard,
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You'll need to create an account or sign in to complete your purchase.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through our encrypted checkout system.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "You can modify or cancel your order within 2 hours of placing it by contacting customer service. After this window, we may have already begun processing your order.",
      },
      {
        question: "Do you offer payment plans?",
        answer:
          "Currently, we don't offer payment plans, but we do accept PayPal which offers its own financing options for qualified customers.",
      },
    ],
  },
  {
    id: "shipping",
    name: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping takes 1 business day. Processing time is additional (1-2 days for in-stock items).",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to Canada, Europe, Australia, and select other countries. International shipping times vary by destination (7-28 business days). Contact us for specific country availability.",
      },
      {
        question: "How much does shipping cost?",
        answer:
          "Standard shipping is $9.99, Express is $19.99, and Overnight is $39.99. We offer free standard shipping on orders over $150 within the US.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order status in your account dashboard.",
      },
    ],
  },
  {
    id: "products",
    name: "Products & Customization",
    icon: Package,
    questions: [
      {
        question: "Are your products handmade?",
        answer:
          "Yes, all our products are handcrafted by skilled Arts & Crafts using traditional techniques. Each piece is unique and may have slight variations that add to its character.",
      },
      {
        question: "Can I request custom sizes or designs?",
        answer:
          "We offer custom sizing and design modifications for most of our products. Contact us with your requirements for a personalized quote. Custom orders typically take 2-4 weeks.",
      },
      {
        question: "What materials do you use?",
        answer:
          "We use high-quality, sustainable materials including reclaimed wood, brass, bronze, iron, and premium glass. Each product listing includes detailed material information.",
      },
      {
        question: "How do I care for my handcrafted items?",
        answer:
          "Each product comes with specific care instructions. Generally, dust regularly with a soft cloth and avoid harsh chemicals. Visit our Care Instructions page for detailed guidance.",
      },
    ],
  },
  {
    id: "returns",
    name: "Returns & Exchanges",
    icon: RotateCcw,
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items. Items must be in original condition and packaging. Custom or personalized items cannot be returned unless defective.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Log into your account, go to Order History, and select 'Return Item'. We'll email you a prepaid return label within 24 hours. Package the item securely and ship it back to us.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 2-3 business days after we receive your return. It may take an additional 3-5 business days for the refund to appear in your account.",
      },
      {
        question: "Do you offer exchanges?",
        answer:
          "We don't offer direct exchanges. To exchange an item, please return the original for a refund and place a new order for the desired item.",
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our handcrafted products, orders, and services.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQ..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Links */}
          {!searchQuery && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {faqCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Card key={category.id} className="cursor-pointer hover:bg-accent/5 transition-colors">
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {category.questions.length} questions
                        </Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.questions.map((faq, index) => {
                          const itemId = `${category.id}-${index}`
                          const isOpen = openItems.includes(itemId)

                          return (
                            <Collapsible key={index}>
                              <CollapsibleTrigger
                                className="flex items-center justify-between w-full p-4 text-left border rounded-lg hover:bg-accent/5 transition-colors"
                                onClick={() => toggleItem(itemId)}
                              >
                                <span className="font-medium">{faq.question}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="px-4 pb-4">
                                <p className="text-muted-foreground">{faq.answer}</p>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">We couldn't find any questions matching your search.</p>
                  <p className="text-sm text-muted-foreground">
                    Try different keywords or browse our categories above.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Support */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="inline-block">
                  <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
                    <CardContent className="p-4 text-center">
                      <HelpCircle className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <h3 className="font-medium">Contact Support</h3>
                      <p className="text-sm text-muted-foreground">Get personalized help</p>
                    </CardContent>
                  </Card>
                </Link>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="font-medium mb-1">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@Arts & Crafts.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="font-medium mb-1">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-xs text-muted-foreground mt-1">Mon-Fri: 9AM-6PM EST</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
