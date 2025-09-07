-- Restore admin policies after RLS reset
-- This script adds admin policies to allow admin users to access all data

-- First ensure admin role exists in the database by setting your profile role to admin
-- You can do this manually: UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- Create admin policies for orders table (admin can see all orders)
DO $$ BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_orders_all" ON public.orders;
    CREATE POLICY "admin_orders_all" ON public.orders
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create admin policies for order_items table (admin can see all order items)
DO $$ BEGIN
  IF to_regclass('public.order_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_order_items_all" ON public.order_items;
    CREATE POLICY "admin_order_items_all" ON public.order_items
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create admin policies for products table (admin can manage all products)
DO $$ BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_products_all" ON public.products;
    CREATE POLICY "admin_products_all" ON public.products
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create admin policies for categories table (admin can manage all categories)
DO $$ BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_categories_all" ON public.categories;
    CREATE POLICY "admin_categories_all" ON public.categories
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create admin policy for profiles table (admin can view all profiles)
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;
    CREATE POLICY "admin_profiles_select_all" ON public.profiles
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() 
          AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Ensure the role column exists and has a default value
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Update your current user to be an admin (replace with your actual user ID if needed)
-- You can find your user ID by running: SELECT auth.uid();
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
