-- Completely fix the infinite recursion in profiles table RLS policies

-- First, drop all existing policies on profiles table to break the recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Disable RLS temporarily to break any existing recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies that don't cause recursion by using a simpler approach
-- Use auth.jwt() instead of auth.uid() to avoid potential recursion
CREATE POLICY "Enable read access for own profile" ON profiles
    FOR SELECT USING (
        auth.jwt() ->> 'sub' = id::text
    );

CREATE POLICY "Enable insert for own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'sub' = id::text
    );

CREATE POLICY "Enable update for own profile" ON profiles
    FOR UPDATE USING (
        auth.jwt() ->> 'sub' = id::text
    ) WITH CHECK (
        auth.jwt() ->> 'sub' = id::text
    );

-- Also ensure products table allows public read access without any profile dependencies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Ensure categories table allows public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);
