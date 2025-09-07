# Database Constraint Fix Instructions

## Problem
The `products` table has a NOT NULL constraint on the `category_id` field, but the application allows creating products without selecting a category. This causes the error:

```
null value in column "category_id" of relation "products" violates not-null constraint
```

## Solution Options

### Option 1: Make category_id Nullable (Recommended)
This allows products to exist without a category.

**Steps:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to "SQL Editor" from the left sidebar
4. Run the following SQL commands one by one:

```sql
-- Step 1: Drop the foreign key constraint
ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;

-- Step 2: Make category_id nullable
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

-- Step 3: Re-add the foreign key constraint (allowing NULL values)
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id);

-- Step 4: Add documentation
COMMENT ON COLUMN products.category_id IS 'References categories table. Can be NULL for uncategorized products.';
```

### Option 2: Create a Default "Uncategorized" Category
This maintains the NOT NULL constraint but adds a default category.

**Steps:**
1. Go to your Supabase Dashboard SQL Editor
2. Run this SQL to create an "Uncategorized" category:

```sql
-- Insert the default uncategorized category
INSERT INTO categories (name, description, image_url) 
VALUES ('Uncategorized', 'Products without a specific category', '/placeholder.jpg?height=300&width=400')
ON CONFLICT DO NOTHING;
```

3. Then update the application to use this default category when none is selected.

## Immediate Workaround (Application Level)
If you can't access the database immediately, you can modify the application code to handle this:

1. **Temporary Fix**: Make category selection required in the form
2. **Better Fix**: Auto-assign a default category when none is selected

## Verification
After applying either solution, you should be able to create products without selecting a category.

## Files Modified
- `scripts/016_make_category_id_nullable.sql` - Contains the database migration
- `app/api/admin/products/route.ts` - May need updates based on chosen solution
- `app/admin/products/add/page.tsx` - Form handling

## Current Categories in Database
Based on the seed data, these categories should exist:
- Mirrors
- Furniture  
- Lighting
- Decor

You can verify this by running:
```sql
SELECT id, name FROM categories ORDER BY name;
```
