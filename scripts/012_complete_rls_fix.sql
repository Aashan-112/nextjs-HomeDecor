-- Complete RLS policy fix that properly handles both regular users and admin access
-- This script ensures all tables have proper policies for both user and admin access

-- First, clean up any conflicting policies
DO $$
DECLARE r record;
BEGIN
  -- Drop all existing policies to start fresh
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Ensure RLS is enabled on all relevant tables
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.order_items') IS NOT NULL THEN
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.wishlist_items') IS NOT NULL THEN
    ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.cart_items') IS NOT NULL THEN
    ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.categories') IS NOT NULL THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- PROFILES table policies (users can read/modify own profile, admins can read all)
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    -- Users can read their own profile
    CREATE POLICY profiles_read_own
      ON public.profiles FOR SELECT TO authenticated
      USING (id = auth.uid());

    -- Users can insert their own profile
    CREATE POLICY profiles_insert_self
      ON public.profiles FOR INSERT TO authenticated
      WITH CHECK (id = auth.uid());

    -- Users can update their own profile
    CREATE POLICY profiles_update_own
      ON public.profiles FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());

    -- Admins can read all profiles
    CREATE POLICY admin_profiles_read_all
      ON public.profiles FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- ORDERS table policies (users can see own orders, admins can see all)
DO $$ BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    -- Users can read their own orders
    CREATE POLICY orders_read_own
      ON public.orders FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    -- Users can insert their own orders
    CREATE POLICY orders_insert_own
      ON public.orders FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    -- Users can update their own orders
    CREATE POLICY orders_update_own
      ON public.orders FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    -- Admins can manage all orders
    CREATE POLICY admin_orders_all
      ON public.orders FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- ORDER_ITEMS table policies (users can see own order items, admins can see all)
DO $$ BEGIN
  IF to_regclass('public.order_items') IS NOT NULL THEN
    -- Users can read their own order items
    CREATE POLICY order_items_read_own
      ON public.order_items FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_id AND o.user_id = auth.uid()
        )
      );

    -- Users can insert their own order items
    CREATE POLICY order_items_insert_own
      ON public.order_items FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_id AND o.user_id = auth.uid()
        )
      );

    -- Admins can manage all order items
    CREATE POLICY admin_order_items_all
      ON public.order_items FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- PRODUCTS table policies (public read for active products, admin manage all)
DO $$ BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    -- Public read access to active products
    CREATE POLICY products_public_read
      ON public.products FOR SELECT TO anon, authenticated
      USING (is_active = true);

    -- Admins can manage all products
    CREATE POLICY admin_products_all
      ON public.products FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- CATEGORIES table policies (public read, admin manage)
DO $$ BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    -- Public read access
    CREATE POLICY categories_public_read
      ON public.categories FOR SELECT TO anon, authenticated
      USING (true);

    -- Admins can manage all categories
    CREATE POLICY admin_categories_all
      ON public.categories FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- CART_ITEMS table policies (users manage own, admins can see all)
DO $$ BEGIN
  IF to_regclass('public.cart_items') IS NOT NULL THEN
    -- Users can manage their own cart items
    CREATE POLICY cart_read_own
      ON public.cart_items FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY cart_insert_own
      ON public.cart_items FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY cart_update_own
      ON public.cart_items FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY cart_delete_own
      ON public.cart_items FOR DELETE TO authenticated
      USING (user_id = auth.uid());

    -- Admins can manage all cart items
    CREATE POLICY admin_cart_all
      ON public.cart_items FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- WISHLIST_ITEMS table policies (users manage own, admins can see all)
DO $$ BEGIN
  IF to_regclass('public.wishlist_items') IS NOT NULL THEN
    -- Users can manage their own wishlist items
    CREATE POLICY wishlist_read_own
      ON public.wishlist_items FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY wishlist_insert_own
      ON public.wishlist_items FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY wishlist_update_own
      ON public.wishlist_items FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY wishlist_delete_own
      ON public.wishlist_items FOR DELETE TO authenticated
      USING (user_id = auth.uid());

    -- Admins can manage all wishlist items
    CREATE POLICY admin_wishlist_all
      ON public.wishlist_items FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;
