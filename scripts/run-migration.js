const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('🔄 Running migration to make category_id nullable...');

    // Step 1: Drop the foreign key constraint
    console.log('Step 1: Dropping foreign key constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;'
    });
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Failed to drop constraint:', dropError);
      throw dropError;
    }
    console.log('✅ Foreign key constraint dropped');

    // Step 2: Modify column to allow NULL
    console.log('Step 2: Making category_id nullable...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;'
    });
    
    if (alterError) {
      console.error('❌ Failed to alter column:', alterError);
      throw alterError;
    }
    console.log('✅ Column made nullable');

    // Step 3: Re-add foreign key constraint
    console.log('Step 3: Re-adding foreign key constraint...');
    const { error: fkError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);'
    });
    
    if (fkError) {
      console.error('❌ Failed to add foreign key constraint:', fkError);
      throw fkError;
    }
    console.log('✅ Foreign key constraint re-added');

    console.log('🎉 Migration completed successfully!');
    console.log('Products can now be created without a category.');
    
  } catch (err) {
    console.error('❌ Error running migration:', err);
    console.log('\n📝 Manual fix instructions:');
    console.log('1. Go to your Supabase dashboard SQL editor');
    console.log('2. Run the SQL from scripts/016_make_category_id_nullable.sql');
    process.exit(1);
  }
}

runMigration();
