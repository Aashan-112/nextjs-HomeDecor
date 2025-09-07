-- Fix RLS policies for products table to ensure all active products are visible to public
-- This addresses the issue where anonymous users can only see 5 products instead of all 9

-- First, check what policies currently exist
DO $$
BEGIN
  RAISE NOTICE 'Current RLS policies for products table:';
END $$;

-- Drop existing product policies that might be too restrictive
DROP POLICY IF EXISTS "products_select_active" ON products;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "admin_products_all" ON products;

-- Create a simple public read policy for active products
CREATE POLICY "products_public_read_all_active"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Create admin policy for full access
CREATE POLICY "admin_products_full_access"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add comment to document the change
COMMENT ON POLICY "products_public_read_all_active" ON products IS 
  'Allows public (anonymous and authenticated) users to read all active products. Fixed issue where only 5 of 9 products were visible.';

COMMENT ON POLICY "admin_products_full_access" ON products IS 
  'Allows admin users full CRUD access to all products.';

-- Display the new policies
DO $$
DECLARE
    policy_record record;
BEGIN
    RAISE NOTICE 'New RLS policies for products table:';
    FOR policy_record IN 
        SELECT policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'products' AND schemaname = 'public'
    LOOP
        RAISE NOTICE 'Policy: %, Command: %, Roles: %', policy_record.policyname, policy_record.cmd, policy_record.roles;
    END LOOP;
END $$;
