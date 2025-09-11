import { ElevatedCarousel, ElevatedCarouselDemo } from "@/components/ui/elevated-carousel"

// Sample product cards
const ProductCard = ({ title, price, image, description, color }: {
  title: string
  price: string
  image: string
  description: string
  color: string
}) => (
  <div className="p-6 text-center">
    <div className={`w-full h-48 bg-gradient-to-br ${color} rounded-xl mb-4 flex items-center justify-center shadow-lg`}>
      <span className="text-white text-2xl font-bold">{image}</span>
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-blue-600">{price}</span>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Add to Cart
      </button>
    </div>
  </div>
)

export default function CarouselDemoPage() {
  const products = [
    {
      title: "Premium Headphones",
      price: "$299.99",
      image: "🎧",
      description: "High-quality wireless headphones with noise cancellation",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Smart Watch",
      price: "$399.99",
      image: "⌚",
      description: "Advanced fitness tracking and smart notifications",
      color: "from-green-500 to-teal-600"
    },
    {
      title: "Gaming Laptop",
      price: "$1,299.99",
      image: "💻",
      description: "Powerful laptop for gaming and professional work",
      color: "from-red-500 to-pink-600"
    },
    {
      title: "Wireless Speaker",
      price: "$149.99",
      image: "🔊",
      description: "Portable speaker with incredible sound quality",
      color: "from-orange-500 to-yellow-600"
    },
    {
      title: "Smartphone",
      price: "$899.99",
      image: "📱",
      description: "Latest flagship phone with amazing camera",
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "Tablet Pro",
      price: "$699.99",
      image: "📱",
      description: "Professional tablet for creative work and productivity",
      color: "from-teal-500 to-blue-600"
    }
  ]

  const productCards = products.map((product, index) => (
    <ProductCard key={index} {...product} />
  ))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Elevated Carousel Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A unique carousel layout with one prominent card on top and two supporting cards below
          </p>
        </div>

        {/* Main Elevated Carousel */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Featured Products
          </h2>
          <ElevatedCarousel 
            autoPlay={true} 
            autoPlayInterval={5000}
            className="py-8"
          >
            {productCards}
          </ElevatedCarousel>
        </section>

        {/* Static Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Static Layout Example
          </h2>
          <ElevatedCarousel 
            autoPlay={false} 
            showNavigation={true}
            className="py-8"
          >
            {productCards.slice(0, 3)}
          </ElevatedCarousel>
        </section>

        {/* Usage Instructions */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            How to Use
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Basic Usage:</h3>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { ElevatedCarousel } from "@/components/ui/elevated-carousel"

<ElevatedCarousel>
  {yourCards}
</ElevatedCarousel>`}
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">With Auto-play:</h3>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`<ElevatedCarousel 
  autoPlay={true} 
  autoPlayInterval={5000}
>
  {yourCards}
</ElevatedCarousel>`}
              </code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>One elevated card on top with enhanced styling</li>
                <li>Two supporting cards positioned at the bottom</li>
                <li>Smooth transitions and hover effects</li>
                <li>Optional auto-play functionality</li>
                <li>Navigation controls and dot indicators</li>
                <li>Responsive design for mobile and desktop</li>
                <li>Dark mode support</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
