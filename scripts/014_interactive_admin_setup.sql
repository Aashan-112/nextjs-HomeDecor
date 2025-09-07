-- Interactive admin setup script
-- First run the query below to see all users, then use their ID or email to set admin

-- Step 1: View all users to find the one you want to make admin
SELECT 
    u.id,
    u.email,
    u.created_at as registered_date,
    p.first_name,
    p.last_name,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✓ ADMIN'
        WHEN p.role = 'customer' THEN 'Customer'
        ELSE 'No Role Set'
    END as current_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 2: After identifying the user, uncomment and modify ONE of these options:

-- Option A: Set admin by email
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Option B: Set admin by user ID  
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'paste-user-id-here';

-- Step 3: Verify the change
-- SELECT 
--   u.email,
--   p.first_name,
--   p.last_name,
--   p.role
-- FROM auth.users u
-- JOIN profiles p ON u.id = p.id
-- WHERE p.role = 'admin';
