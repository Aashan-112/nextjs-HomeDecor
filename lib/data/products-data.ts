import type { Product, Category } from "@/lib/types"

export const CATEGORIES: Omit<Category, "id" | "created_at" | "updated_at">[] = [
  {
    name: "Mirrors",
    description: "Handcrafted decorative mirrors for your home",
    image_url: "/decorative-mirrors.png",
  },
  {
    name: "Furniture",
    description: "Arts & Crafts-made furniture pieces",
    image_url: "/handcrafted-furniture.png",
  },
  {
    name: "Lighting",
    description: "Unique lighting fixtures and lamps",
    image_url: "/Arts & Crafts-lighting.png",
  },
  {
    name: "Decor",
    description: "Home decor and accessories",
    image_url: "/home-decor-accessories.png",
  },
  {
    name: "Textiles",
    description: "Handwoven rugs, cushions, and fabric art",
    image_url: "/handwoven-textiles.png",
  },
  {
    name: "Artificial Flowers",
    description: "Realistically rendered flowers with some fresh aroma",
    image_url: "/flowers.jpg",
  },

]

export const FEATURED_PRODUCTS: Omit<Product, "id" | "category_id" | "created_at" | "updated_at">[] = [
  {
    name: "Rustic Wooden Mirror",
    description:
      "A beautiful handcrafted mirror with reclaimed wood frame, perfect for adding warmth to any room. Each piece tells a unique story through its natural wood grain and weathered finish.",
    price: 149.99,
    compare_at_price: 199.99,
    sku: "RWM-001",
    images: ["/rustic-wooden-mirror.png"],
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    materials: ["Reclaimed Wood", "Glass"],
    colors: ["Natural", "Brown"],
    dimensions: { width: 24, height: 36, depth: 2 },
    weight: 8.5,
  },
  {
    name: "Vintage Brass Mirror",
    description:
      "An elegant vintage-style brass mirror that brings sophistication to your space. Features intricate detailing and an antique finish that complements both modern and traditional decor.",
    price: 89.99,
    compare_at_price: 119.99,
    sku: "VBM-002",
    images: ["/vintage-brass-mirror.png"],
    stock_quantity: 8,
    is_active: true,
    is_featured: true,
    materials: ["Brass", "Glass"],
    colors: ["Gold", "Brass"],
    dimensions: { width: 18, height: 24, depth: 1 },
    weight: 3.2,
  },
  {
    name: "Handwoven Rattan Chair",
    description:
      "Comfortable and stylish rattan chair, perfect for indoor or outdoor use. Expertly woven by skilled Arts & Crafts using sustainable materials.",
    price: 299.99,
    sku: "HRC-003",
    images: ["/handwoven-rattan-chair.png"],
    stock_quantity: 5,
    is_active: true,
    is_featured: true,
    materials: ["Rattan", "Cotton Cushion"],
    colors: ["Natural", "Beige"],
    dimensions: { width: 26, height: 32, depth: 28 },
    weight: 12.0,
  },
  {
    name: "Ceramic Table Lamp",
    description:
      "Arts & Crafts-made ceramic table lamp with unique glazed finish. Hand-thrown and fired in small batches, each lamp has subtle variations that make it one-of-a-kind.",
    price: 79.99,
    compare_at_price: 99.99,
    sku: "CTL-004",
    images: ["/ceramic-table-lamp.png"],
    stock_quantity: 12,
    is_active: true,
    is_featured: true,
    materials: ["Ceramic", "Fabric Shade"],
    colors: ["White", "Blue"],
    dimensions: { width: 8, height: 16, depth: 8 },
    weight: 2.8,
  },
  {
    name: "Macrame Wall Hanging",
    description:
      "Beautiful handmade macrame wall hanging to add texture to your walls. Created using traditional knotting techniques with natural cotton cord.",
    price: 45.99,
    sku: "MWH-005",
    images: ["/macrame-wall-hanging.png"],
    stock_quantity: 20,
    is_active: true,
    is_featured: true,
    materials: ["Cotton Cord"],
    colors: ["Natural", "Cream"],
    dimensions: { width: 18, height: 24, depth: 4 },
    weight: 0.8,
  },
  {
    name: "Live Edge Coffee Table",
    description:
      "Solid walnut coffee table with live edge design. Each piece is unique, showcasing the natural beauty of the wood grain and organic edge.",
    price: 449.99,
    compare_at_price: 549.99,
    sku: "WCT-006",
    images: ["/live-edge-coffee-table.png"],
    stock_quantity: 3,
    is_active: true,
    is_featured: true,
    materials: ["Walnut Wood", "Steel Legs"],
    colors: ["Natural", "Dark Brown"],
    dimensions: { width: 48, height: 18, depth: 24 },
    weight: 45.0,
  },
  {
    name: "Woven Pendant Light",
    description:
      "Modern pendant light with woven bamboo shade, perfect for dining areas. Sustainable materials meet contemporary design.",
    price: 129.99,
    sku: "PLF-007",
    images: ["/woven-pendant-light.png"],
    stock_quantity: 7,
    is_active: true,
    is_featured: true,
    materials: ["Bamboo", "Metal"],
    colors: ["Natural", "Black"],
    dimensions: { width: 12, height: 10, depth: 12 },
    weight: 1.5,
  },
  {
    name: "Ceramic Vase Collection",
    description:
      "Set of three handmade ceramic vases in different sizes. Perfect for displaying fresh flowers or as standalone decorative pieces.",
    price: 69.99,
    compare_at_price: 89.99,
    sku: "CVS-008",
    images: ["/ceramic-vase-set.png"],
    stock_quantity: 10,
    is_active: true,
    is_featured: true,
    materials: ["Ceramic"],
    colors: ["White", "Terracotta"],
    dimensions: { width: 6, height: 12, depth: 6 },
    weight: 2.2,
  },
]

export const ALL_PRODUCTS: Omit<Product, "id" | "category_id" | "created_at" | "updated_at">[] = [
  ...FEATURED_PRODUCTS,
  // Additional non-featured products
  {
    name: "Woven Storage Basket",
    description:
      "Handwoven storage basket made from natural seagrass. Perfect for organizing while adding texture to your space.",
    price: 34.99,
    sku: "WSB-009",
    images: ["/woven-storage-basket.png"],
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    materials: ["Seagrass"],
    colors: ["Natural"],
    dimensions: { width: 14, height: 12, depth: 14 },
    weight: 1.2,
  },
  {
    name: "Copper Wall Sconce",
    description: "Handcrafted copper wall sconce with warm Edison bulb. Adds industrial charm to any room.",
    price: 95.99,
    sku: "CWS-010",
    images: ["/copper-wall-sconce.png"],
    stock_quantity: 6,
    is_active: true,
    is_featured: false,
    materials: ["Copper", "Edison Bulb"],
    colors: ["Copper", "Brass"],
    dimensions: { width: 6, height: 8, depth: 4 },
    weight: 1.8,
  },
  {
    name: "Embroidered Throw Pillow",
    description: "Hand-embroidered throw pillow with geometric patterns. Made with organic cotton and natural dyes.",
    price: 28.99,
    sku: "ETP-011",
    images: ["/embroidered-throw-pillow.png"],
    stock_quantity: 18,
    is_active: true,
    is_featured: false,
    materials: ["Organic Cotton", "Natural Dyes"],
    colors: ["Blue", "White", "Natural"],
    dimensions: { width: 18, height: 18, depth: 6 },
    weight: 0.5,
  },
  {
    name: "Reclaimed Wood Shelf",
    description: "Floating shelf made from reclaimed barn wood. Each piece has unique character marks and patina.",
    price: 65.99,
    sku: "RWS-012",
    images: ["/reclaimed-wood-shelf.png"],
    stock_quantity: 12,
    is_active: true,
    is_featured: false,
    materials: ["Reclaimed Wood", "Steel Brackets"],
    colors: ["Natural", "Weathered"],
    dimensions: { width: 24, height: 2, depth: 8 },
    weight: 3.5,
  },
]

// Helper functions for data management
export function getProductsByCategory(categoryName: string): typeof ALL_PRODUCTS {
  const categoryIndex = CATEGORIES.findIndex((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())
  if (categoryIndex === -1) return []

  // In a real implementation, you'd filter by category_id
  // For now, we'll distribute products across categories
  const productsPerCategory = Math.ceil(ALL_PRODUCTS.length / CATEGORIES.length)
  const startIndex = categoryIndex * productsPerCategory
  const endIndex = startIndex + productsPerCategory

  return ALL_PRODUCTS.slice(startIndex, endIndex)
}

export function getFeaturedProducts(): typeof FEATURED_PRODUCTS {
  return FEATURED_PRODUCTS
}

export function getProductBySku(sku: string): (typeof ALL_PRODUCTS)[0] | undefined {
  return ALL_PRODUCTS.find((product) => product.sku === sku)
}

export function searchProducts(query: string): typeof ALL_PRODUCTS {
  const searchTerm = query.toLowerCase()
  return ALL_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.materials.some((material) => material.toLowerCase().includes(searchTerm)) ||
      product.colors.some((color) => color.toLowerCase().includes(searchTerm)),
  )
}

export function getProductsByPriceRange(min: number, max: number): typeof ALL_PRODUCTS {
  return ALL_PRODUCTS.filter((product) => product.price >= min && product.price <= max)
}

export function getAvailableMaterials(): string[] {
  const materials = new Set<string>()
  ALL_PRODUCTS.forEach((product) => {
    product.materials.forEach((material) => materials.add(material))
  })
  return Array.from(materials).sort()
}

export function getAvailableColors(): string[] {
  const colors = new Set<string>()
  ALL_PRODUCTS.forEach((product) => {
    product.colors.forEach((color) => colors.add(color))
  })
  return Array.from(colors).sort()
}
