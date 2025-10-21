-- Assign club_admin role to the test user
-- User: clubadmin@test.com
-- Password: Test1234!

-- Step 1: Get the club ID
SELECT id, name FROM clubs WHERE is_active = true LIMIT 5;

-- Step 2: Assign club_admin role
-- Replace CLUB_ID_HERE with the ID from Step 1
INSERT INTO user_roles (user_id, club_id, role)
VALUES (
  '6528c91d-421a-401e-bc17-73b7db46a56e',  -- clubadmin@test.com
  'CLUB_ID_HERE',  -- Replace with actual club ID
  'club_admin'
);

-- Step 3: Verify
SELECT
  u.email,
  ur.role,
  c.name as club_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN clubs c ON ur.club_id = c.id
WHERE u.email = 'clubadmin@test.com';
