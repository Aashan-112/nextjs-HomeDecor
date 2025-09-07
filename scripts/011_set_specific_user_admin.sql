-- Manually set a specific user as admin
-- You can use either the user ID or email address

-- First, ensure the role column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Option 1: Set admin by user ID (replace 'USER_ID_HERE' with actual UUID)
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';

-- Option 2: Set admin by email (replace 'user@example.com' with actual email)
-- UPDATE profiles SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'user@example.com'
-- );

-- Option 3: View all users to find the one you want to make admin
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- After reviewing the users above, uncomment and modify one of these commands:

-- To set admin by user ID:
-- UPDATE profiles SET role = 'admin' WHERE id = 'REPLACE_WITH_USER_ID';

-- To set admin by email:
-- UPDATE profiles SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_EMAIL');

-- To verify the update worked:
-- SELECT u.email, p.first_name, p.last_name, p.role 
-- FROM profiles p 
-- JOIN auth.users u ON p.id = u.id 
-- WHERE p.role = 'admin';
