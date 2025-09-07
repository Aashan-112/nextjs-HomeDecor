// Test script to verify real-time updates are working
// Run this with: node test-realtime-updates.js

const BASE_URL = 'http://localhost:3000'

async function testProductCount() {
  console.log('🧪 Testing product count from different endpoints...')
  
  try {
    // Test public products API
    console.log('\n1. Testing /api/public/products')
    const response = await fetch(`${BASE_URL}/api/public/products?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
    
    if (response.ok) {
      const products = await response.json()
      console.log(`✅ Public API: ${products.length} products`)
      console.log(`   Latest: ${products[0]?.name} (${products[0]?.created_at})`)
    } else {
      console.log(`❌ Public API failed: ${response.status}`)
    }

    // Test featured products API
    console.log('\n2. Testing /api/public/featured-products')
    const featuredResponse = await fetch(`${BASE_URL}/api/public/featured-products?t=${Date.now()}`, {
      cache: 'no-store'
    })
    
    if (featuredResponse.ok) {
      const featuredProducts = await featuredResponse.json()
      console.log(`✅ Featured API: ${featuredProducts.length} featured products`)
      console.log(`   Latest featured: ${featuredProducts[0]?.name}`)
    } else {
      console.log(`❌ Featured API failed: ${featuredResponse.status}`)
    }

    // Test diagnosis API
    console.log('\n3. Testing /api/diagnose/products')
    const diagResponse = await fetch(`${BASE_URL}/api/diagnose/products`)
    
    if (diagResponse.ok) {
      const diagData = await diagResponse.json()
      console.log(`✅ Diagnosis API results:`)
      console.log(`   Service Role: ${diagData.tests.serviceRoleAll.count} products`)
      console.log(`   Public API: ${diagData.tests.publicApiReplication.count} products`)
      console.log(`   Anonymous Client: ${diagData.tests.anonymousClient.count} products`)
      console.log(`   Issues: ${diagData.summary.issues.join(', ')}`)
    } else {
      console.log(`❌ Diagnosis API failed: ${diagResponse.status}`)
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message)
  }
}

async function continuousMonitoring() {
  console.log('\n🔄 Starting continuous monitoring (every 5 seconds)...')
  console.log('Press Ctrl+C to stop')
  
  let lastProductCount = 0
  
  setInterval(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/public/products?t=${Date.now()}`)
      if (response.ok) {
        const products = await response.json()
        const currentCount = products.length
        
        if (currentCount !== lastProductCount) {
          console.log(`\n🎉 PRODUCT COUNT CHANGED!`)
          console.log(`   Previous: ${lastProductCount}`)
          console.log(`   Current: ${currentCount}`)
          console.log(`   Time: ${new Date().toLocaleTimeString()}`)
          
          if (currentCount > lastProductCount) {
            const newProducts = currentCount - lastProductCount
            console.log(`   📈 ${newProducts} new product(s) detected!`)
          } else {
            const removedProducts = lastProductCount - currentCount
            console.log(`   📉 ${removedProducts} product(s) were removed`)
          }
          
          lastProductCount = currentCount
        } else {
          // Silent monitoring - only show dot every 10 checks
          process.stdout.write('.')
        }
      }
    } catch (error) {
      console.error('\n❌ Monitoring error:', error.message)
    }
  }, 5000)
}

// Main execution
console.log('🚀 Real-time Updates Test Script')
console.log('================================')

testProductCount().then(() => {
  console.log('\n' + '='.repeat(50))
  return continuousMonitoring()
})

module.exports = { testProductCount }
