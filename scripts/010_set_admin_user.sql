-- Set the current authenticated user as an admin
-- This script should be run while logged in as the user you want to make admin

-- First, ensure the role column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Set the current user as admin
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- Verify the update
SELECT 
    id, 
    first_name, 
    last_name, 
    role,
    created_at
FROM profiles 
WHERE id = auth.uid();
