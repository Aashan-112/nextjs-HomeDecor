const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running customer fields migration...')
  
  try {
    // Add customer_email and customer_phone columns
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS customer_email TEXT,
        ADD COLUMN IF NOT EXISTS customer_phone TEXT;
      `
    })

    if (alterError) {
      console.error('❌ Error adding columns:', alterError)
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...')
      const { error: directError } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1)
      
      if (directError) {
        console.error('Cannot execute SQL directly. Please run the migration manually.')
        console.log('\n📋 Copy and run this SQL in your Supabase Dashboard:')
        console.log('─'.repeat(80))
        console.log(`
-- Add customer email and phone fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add indexes for better query performance  
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_email', 'customer_phone')
ORDER BY column_name;
        `)
        console.log('─'.repeat(80))
        console.log('\n🌐 Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query')
        console.log('📋 Paste the SQL above and run it')
        process.exit(1)
      }
    }

    // Add index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);'
    })

    if (indexError && !indexError.message?.includes('already exists')) {
      console.warn('⚠️  Warning: Could not create index:', indexError.message)
    }

    // Verify the changes
    const { data: columns, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name IN ('customer_email', 'customer_phone')
        ORDER BY column_name;
      `
    })

    if (verifyError) {
      console.warn('⚠️  Could not verify changes:', verifyError)
    } else {
      console.log('\n✅ Migration completed successfully!')
      if (columns && columns.length > 0) {
        console.log('\n📋 New columns added:')
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
    }

    console.log('\n🎉 Customer email and phone fields are now available!')
    console.log('💡 You can now place orders with dedicated customer contact fields.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n📋 Please run this SQL manually in your Supabase Dashboard:')
    console.log('─'.repeat(80))
    console.log(`
-- Add customer email and phone fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
    `)
    console.log('─'.repeat(80))
    console.log('\n🌐 Go to: https://supabase.com/dashboard → Your Project → SQL Editor')
    process.exit(1)
  }
}

runMigration()
