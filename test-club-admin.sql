-- First, let's see what clubs we have
SELECT id, name, slug FROM clubs ORDER BY name;

-- Check if we have any club_admin users
SELECT 
  u.email,
  ur.role,
  c.name as club_name
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN clubs c ON ur.club_id = c.id
WHERE ur.role = 'club_admin';
