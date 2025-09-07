-- Set a specific user as admin by their email address
-- Replace 'YOUR_EMAIL_HERE' with the actual email address

-- Ensure the role column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Set the user as admin (REPLACE 'YOUR_EMAIL_HERE' with actual email)
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'aliaashan902@gmail.com'
);

-- Verify the update worked
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'YOUR_EMAIL_HERE';
