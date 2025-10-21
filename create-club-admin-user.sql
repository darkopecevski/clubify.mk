-- =====================================================
-- Create Club Admin Test User
-- =====================================================
-- This script creates a test user with club_admin role
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Step 1: First, you need to create a user via Supabase Auth
-- Go to Authentication > Users > Add User (via email)
-- Email: clubadmin@test.com
-- Password: Test1234! (or your choice)
-- Email Confirm: Enable

-- Step 2: After creating the user in Auth, get the user ID and run this:

-- Find the user ID (copy this ID)
SELECT id, email FROM auth.users WHERE email = 'clubadmin@test.com';

-- Step 3: Get a club ID to assign the admin to
SELECT id, name, slug FROM clubs LIMIT 5;

-- Step 4: Create the club_admin role
-- Replace 'USER_ID_HERE' and 'CLUB_ID_HERE' with actual IDs from above
INSERT INTO user_roles (user_id, club_id, role)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from Step 2
  'CLUB_ID_HERE',  -- Replace with actual club ID from Step 3
  'club_admin'
);

-- Step 5: Verify the role was created
SELECT
  u.email,
  ur.role,
  c.name as club_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN clubs c ON ur.club_id = c.id
WHERE u.email = 'clubadmin@test.com';

-- =====================================================
-- Alternative: If you want to use an existing user
-- =====================================================
-- Just assign them the club_admin role:

-- 1. Find your user
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. Pick a club
SELECT id, name FROM clubs;

-- 3. Assign club_admin role
INSERT INTO user_roles (user_id, club_id, role)
VALUES (
  'YOUR_USER_ID',
  'CLUB_ID',
  'club_admin'
);
