-- Drop the problematic policies
DROP POLICY IF EXISTS "user_roles_all_super_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_club_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_club_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_club_admin" ON user_roles;

DROP POLICY IF EXISTS "users_select_super_admin" ON users;
DROP POLICY IF EXISTS "users_select_club_admin" ON users;

DROP POLICY IF EXISTS "clubs_all_super_admin" ON clubs;
DROP POLICY IF EXISTS "clubs_update_club_admin" ON clubs;

DROP POLICY IF EXISTS "teams_all_super_admin" ON teams;
DROP POLICY IF EXISTS "teams_all_club_admin" ON teams;
DROP POLICY IF EXISTS "teams_select_coach" ON teams;

-- =============================================
-- HELPER FUNCTIONS TO CHECK USER ROLE
-- =============================================
-- These functions avoid RLS recursion by using SECURITY DEFINER

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's club IDs (for club_admin, coach, etc.)
CREATE OR REPLACE FUNCTION public.user_club_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT club_id FROM public.user_roles
  WHERE user_id = auth.uid()
  AND club_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has a specific role in a club
CREATE OR REPLACE FUNCTION public.user_has_club_role(check_role user_role, check_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
    AND club_id = check_club_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FIXED RLS POLICIES - USERS TABLE
-- =============================================

-- Super admins can view all users
CREATE POLICY "users_select_super_admin" ON users
  FOR SELECT
  USING (public.is_super_admin());

-- Club admins can view users in their clubs
CREATE POLICY "users_select_club_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = users.id
      AND ur2.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- FIXED RLS POLICIES - CLUBS TABLE
-- =============================================

-- Super admins can do everything
CREATE POLICY "clubs_all_super_admin" ON clubs
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can update their own club
CREATE POLICY "clubs_update_club_admin" ON clubs
  FOR UPDATE
  USING (clubs.id IN (SELECT public.user_club_ids()));

-- =============================================
-- FIXED RLS POLICIES - USER_ROLES TABLE
-- =============================================

-- Super admins can do everything with user_roles
CREATE POLICY "user_roles_all_super_admin" ON user_roles
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can view roles in their clubs
CREATE POLICY "user_roles_select_club_admin" ON user_roles
  FOR SELECT
  USING (user_roles.club_id IN (SELECT public.user_club_ids()));

-- Club admins can insert roles in their clubs (but not club_admin or super_admin)
CREATE POLICY "user_roles_insert_club_admin" ON user_roles
  FOR INSERT
  WITH CHECK (
    role NOT IN ('club_admin', 'super_admin')
    AND user_roles.club_id IN (SELECT public.user_club_ids())
    AND public.user_has_club_role('club_admin', user_roles.club_id)
  );

-- Club admins can delete non-admin roles in their clubs
CREATE POLICY "user_roles_delete_club_admin" ON user_roles
  FOR DELETE
  USING (
    role NOT IN ('club_admin', 'super_admin')
    AND user_roles.club_id IN (SELECT public.user_club_ids())
    AND public.user_has_club_role('club_admin', user_roles.club_id)
  );

-- =============================================
-- FIXED RLS POLICIES - TEAMS TABLE
-- =============================================

-- Super admins can do everything
CREATE POLICY "teams_all_super_admin" ON teams
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can do everything for their club's teams
CREATE POLICY "teams_all_club_admin" ON teams
  FOR ALL
  USING (
    teams.club_id IN (SELECT public.user_club_ids())
    AND public.user_has_club_role('club_admin', teams.club_id)
  );

-- Coaches can view their club's teams
CREATE POLICY "teams_select_coach" ON teams
  FOR SELECT
  USING (teams.club_id IN (SELECT public.user_club_ids()));
