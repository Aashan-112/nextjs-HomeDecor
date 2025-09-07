-- Simple script to add admin policies for orders and products
-- This doesn't drop existing policies, just adds the missing admin ones

-- Ensure the role column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Add admin policy for orders table (allows admins to see all orders)
DO $$ BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_orders_all" ON public.orders;
    CREATE POLICY "admin_orders_all" ON public.orders
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Add admin policy for order_items table
DO $$ BEGIN
  IF to_regclass('public.order_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_order_items_all" ON public.order_items;
    CREATE POLICY "admin_order_items_all" ON public.order_items
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Add admin policy for products table (allows admins to manage all products)
DO $$ BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_products_all" ON public.products;
    CREATE POLICY "admin_products_all" ON public.products
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Add admin policy for categories table
DO $$ BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_categories_all" ON public.categories;
    CREATE POLICY "admin_categories_all" ON public.categories
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Add admin policy for profiles table (allows admins to read all profiles)
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_profiles_read_all" ON public.profiles;
    CREATE POLICY "admin_profiles_read_all" ON public.profiles
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;
