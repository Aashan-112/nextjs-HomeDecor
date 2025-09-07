-- Make category_id nullable in products table to allow products without categories
-- This fixes the NOT NULL constraint error when trying to create products without a category

-- Drop the foreign key constraint first
ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;

-- Modify the column to allow NULL values
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

-- Re-add the foreign key constraint (this will still reference categories table but allow NULL)
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id);

-- Add a comment to document this change
COMMENT ON COLUMN products.category_id IS 'References categories table. Can be NULL for uncategorized products.';
