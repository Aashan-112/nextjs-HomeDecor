-- Fix profiles table RLS policy to handle null auth.uid() properly
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create new policies that explicitly handle null values
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );
