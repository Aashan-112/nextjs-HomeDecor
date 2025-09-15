import { NextResponse } from 'next/server'

// Static pages configuration
const staticPages = [
  {
    url: '',
    changeFreq: 'daily',
    priority: '1.0',
    lastMod: new Date().toISOString()
  },
  {
    url: '/about',
    changeFreq: 'monthly',
    priority: '0.8',
    lastMod: new Date().toISOString()
  },
  {
    url: '/products',
    changeFreq: 'weekly',
    priority: '0.9',
    lastMod: new Date().toISOString()
  },
  {
    url: '/contact',
    changeFreq: 'monthly',
    priority: '0.7',
    lastMod: new Date().toISOString()
  },
  {
    url: '/categories',
    changeFreq: 'weekly',
    priority: '0.8',
    lastMod: new Date().toISOString()
  }
]

// Mock product data - replace with actual database query
const getProducts = async () => {
  // This would typically fetch from your database
  // For now, returning mock data based on your existing structure
  return [
    { id: '1', slug: 'elegant-mirror-set', updatedAt: '2024-01-15T10:00:00Z' },
    { id: '2', slug: 'rustic-wall-art', updatedAt: '2024-01-14T15:30:00Z' },
    { id: '3', slug: 'decorative-photo-frames', updatedAt: '2024-01-13T09:45:00Z' },
    // Add more products as needed
  ]
}

// Mock category data - replace with actual database query
const getCategories = async () => {
  return [
    { id: '1', slug: 'mirrors', updatedAt: '2024-01-10T12:00:00Z' },
    { id: '2', slug: 'wall-art', updatedAt: '2024-01-09T14:30:00Z' },
    { id: '3', slug: 'decorative-accessories', updatedAt: '2024-01-08T16:15:00Z' },
  ]
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://99artsandcrafts.com'
    
    // Fetch dynamic content
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories()
    ])

    // Generate sitemap XML
    const sitemap = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"
        xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\"
        xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"
        xmlns:mobile=\"http://www.google.com/schemas/sitemap-mobile/1.0\"
        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\"
        xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\">
${staticPages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastMod}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\\n')}
${products
  .map(
    product => `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\\n')}
${categories
  .map(
    category => `  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${category.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
