-- Create Admin User Setup Script
-- Run this in your Supabase SQL Editor

-- First, let's check if the profiles table exists and has the correct structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY table_name, ordinal_position;

-- If profiles table doesn't exist, create it
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin access policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Now let's check existing users
SELECT 
  u.id, 
  u.email, 
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Update existing user to admin (Replace 'your-email@domain.com' with your actual email)
-- IMPORTANT: Replace the email below with your actual email address
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@domain.com';

-- If no profile exists for your user, create one manually
-- IMPORTANT: Replace the email and UUID below with your actual details
-- You can get your user ID from the auth.users table above
/*
INSERT INTO profiles (id, email, role, created_at, updated_at) 
VALUES (
  'your-user-id-from-auth-users', 
  'your-email@domain.com', 
  'admin', 
  NOW(), 
  NOW()
) 
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();
*/

-- Alternative: Make the first user an admin automatically
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verify the admin user was created
SELECT 
  u.id, 
  u.email, 
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- Grant necessary permissions to authenticated users
-- (This might not be needed depending on your Supabase setup)
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
