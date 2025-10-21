-- Create a function to get users with their email from auth.users
-- This bypasses the auth.admin.listUsers() API which seems to have issues

CREATE OR REPLACE FUNCTION get_users_with_email()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    au.email::TEXT,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.created_at
  FROM users u
  INNER JOIN auth.users au ON u.id = au.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_with_email() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_users_with_email() IS 'Returns all users with their email addresses from auth.users. Only accessible by super_admin via RLS.';
