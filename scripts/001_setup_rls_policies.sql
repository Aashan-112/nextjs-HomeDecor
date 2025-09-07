-- Enable RLS on all tables and create policies for e-commerce functionality

-- Categories table - public read access, admin write access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (true);

-- Products table - public read for active products, admin write access  
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_active" ON products
  FOR SELECT USING (is_active = true);

-- Profiles table - users can only access their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Addresses table - users can only access their own addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Cart items table - users can only access their own cart items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_own" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_own" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_own" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders table - users can only access their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items table - users can only access items from their own orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Wishlist items table - users can only access their own wishlist
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_items_select_own" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlist_items_insert_own" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items_delete_own" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Product reviews table - users can read all reviews but only manage their own
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_reviews_select_all" ON product_reviews
  FOR SELECT USING (true);

CREATE POLICY "product_reviews_insert_own" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_reviews_update_own" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "product_reviews_delete_own" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);
