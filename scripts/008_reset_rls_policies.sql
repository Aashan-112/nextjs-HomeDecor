-- Reset and replace RLS policies to fix 42P17 recursion on profiles
-- Apply this script in the Supabase SQL editor (or as a migration) in your project database.

-- 1) Drop existing policies on affected tables to remove recursive/invalid rules
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='wishlist_items' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.wishlist_items', r.policyname);
  END LOOP;
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='cart_items' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.cart_items', r.policyname);
  END LOOP;
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='categories' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', r.policyname);
  END LOOP;
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='products' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', r.policyname);
  END LOOP;
END $$;

-- 2) Ensure RLS is enabled on relevant tables (guarded by existence checks)
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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

-- 3) Create minimal, non-recursive policies
-- Note: these policies do not reference profiles from within profiles, avoiding recursion

-- profiles: users can read/insert/update their own profile only
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    CREATE POLICY profiles_read_own
      ON public.profiles FOR SELECT TO authenticated
      USING (id = auth.uid());

    CREATE POLICY profiles_insert_self
      ON public.profiles FOR INSERT TO authenticated
      WITH CHECK (id = auth.uid());

    CREATE POLICY profiles_update_own
      ON public.profiles FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- wishlist_items: user can manage their own
DO $$ BEGIN
  IF to_regclass('public.wishlist_items') IS NOT NULL THEN
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
  END IF;
END $$;

-- cart_items: user can manage their own
DO $$ BEGIN
  IF to_regclass('public.cart_items') IS NOT NULL THEN
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
  END IF;
END $$;

-- products: public read (restrict to active products)
DO $$ BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    CREATE POLICY products_public_read
      ON public.products FOR SELECT TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- categories: public read
DO $$ BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    CREATE POLICY categories_public_read
      ON public.categories FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- 4) Optional: verify foreign keys exist for clean joins (no-op if they already exist)
-- You can run these separately if needed; commented to avoid errors on duplicates.
-- ALTER TABLE public.cart_items
--   ADD CONSTRAINT cart_items_product_fk
--   FOREIGN KEY (product_id)
--   REFERENCES public.products(id)
--   ON DELETE RESTRICT;
--
-- ALTER TABLE public.wishlist_items
--   ADD CONSTRAINT wishlist_items_product_fk
--   FOREIGN KEY (product_id)
--   REFERENCES public.products(id)
--   ON DELETE RESTRICT;
