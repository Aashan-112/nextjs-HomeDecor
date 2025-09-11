import { CardStackCarousel, CardStackCarouselDemo } from "@/components/ui/card-stack-carousel"
import { ProductCard } from "@/components/product-card"

// Sample product data
const sampleProducts = [
  {
    id: "1",
    sku: "P-001",
    name: "Handcrafted Leather Bag",
    description: "Premium leather handbag",
    price: 299.99,
    currency: "USD",
    stock_quantity: 10,
    images: ["/api/placeholder/300/200"],
    category: "bags",
    category_id: "bags",
    is_featured: true,
    is_active: true,
    average_rating: 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    materials: ["leather", "fabric"],
    colors: ["black", "brown"]
  },
  {
    id: "2", 
    sku: "P-002",
    name: "Artisan Jewelry Box",
    description: "Beautiful wooden jewelry storage",
    price: 149.99,
    currency: "USD",
    stock_quantity: 5,
    images: ["/api/placeholder/300/200"],
    category: "accessories",
    category_id: "accessories",
    is_featured: true,
    is_active: true,
    average_rating: 4.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    materials: ["wood", "metal"],
    colors: ["brown", "gold"]
  },
  {
    id: "3",
    sku: "P-003",
    name: "Ceramic Vase Set",
    description: "Hand-painted ceramic vases",
    price: 89.99,
    currency: "USD",
    stock_quantity: 8,
    images: ["/api/placeholder/300/200"],
    category: "home-decor",
    category_id: "home-decor",
    is_featured: true,
    is_active: true,
    average_rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    materials: ["ceramic"],
    colors: ["white", "blue", "green"]
  },
  {
    id: "4",
    sku: "P-004",
    name: "Woven Wall Art",
    description: "Traditional macrame wall hanging",
    price: 199.99,
    currency: "USD",
    stock_quantity: 3,
    images: ["/api/placeholder/300/200"],
    category: "wall-art",
    category_id: "wall-art",
    is_featured: true,
    is_active: true,
    average_rating: 4.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    materials: ["cotton", "wood"],
    colors: ["cream", "beige"]
  },
  {
    id: "5",
    sku: "P-005",
    name: "Wooden Sculpture",
    description: "Hand-carved decorative piece",
    price: 399.99,
    currency: "USD",
    stock_quantity: 2,
    images: ["/api/placeholder/300/200"],
    category: "sculptures",
    category_id: "sculptures",
    is_featured: true,
    is_active: true,
    average_rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    materials: ["wood"],
    colors: ["natural"]
  }]

export default function CardStackDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Card Stack Carousel Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the mesmerizing 3D card stack carousel with depth, rotation, and smooth transitions
          </p>
        </div>

        {/* Demo Section 1: Sample Cards */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Sample Product Cards
          </h2>
          <CardStackCarouselDemo />
        </section>

        {/* Demo Section 2: Real Product Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Ecommerce Product Showcase
          </h2>
          <div className="flex justify-center">
            <CardStackCarousel 
              autoPlay={true} 
              autoPlayInterval={4000}
              cardWidth={280}
              minCardHeight={380}
              className="py-8"
            >
              {sampleProducts.map((product) => (
                <div key={product.id} className="w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                  <ProductCard product={product} />
                </div>
              ))}
            </CardStackCarousel>
          </div>
        </section>

        {/* Demo Section 3: Different Sizes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Compact Version
          </h2>
          <div className="flex justify-center">
            <CardStackCarousel 
              autoPlay={false}
              cardWidth={240}
              minCardHeight={320}
              className="py-4"
            >
              {sampleProducts.slice(0, 3).map((product, index) => (
                <div key={product.id} className={`w-full h-full p-4 text-white flex flex-col justify-between rounded-xl ${
                  index === 0 ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                  index === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                  'bg-gradient-to-br from-emerald-500 to-green-600'
                }`}>
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                    <div className="w-20 h-20 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-3">${product.price}</div>
                    <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </CardStackCarousel>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Card Stack Carousel Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">3D Card Stacking:</h3>
                <p className="text-sm">Cards are positioned in a realistic 3D stack with depth, rotation, and perspective</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Smooth Animations:</h3>
                <p className="text-sm">Fluid 700ms transitions with easing for natural card movement</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Interactive Navigation:</h3>
                <p className="text-sm">Click on any card, use arrow buttons, or dot indicators to navigate</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Visual Effects:</h3>
                <p className="text-sm">Progressive blur, scaling, and brightness changes for depth perception</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Auto-play Support:</h3>
                <p className="text-sm">Optional automatic progression with customizable intervals</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Customizable:</h3>
                <p className="text-sm">Adjustable card dimensions, spacing, and animation timing</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Usage Example:</h3>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`<CardStackCarousel 
  autoPlay={true} 
  autoPlayInterval={5000}
  cardWidth={320}
  minCardHeight={400}
>
  {products.map(product => (
    <YourCardComponent key={product.id} product={product} />
  ))}
</CardStackCarousel>`}
            </code>
          </div>
        </section>
      </div>
    </div>
  )
}
