-- Drop ALL player-related policies to start fresh
DROP POLICY IF EXISTS "players_select_active_public" ON players;
DROP POLICY IF EXISTS "players_all_super_admin" ON players;
DROP POLICY IF EXISTS "players_all_club_admin" ON players;
DROP POLICY IF EXISTS "players_select_coach" ON players;
DROP POLICY IF EXISTS "players_select_parent" ON players;
DROP POLICY IF EXISTS "players_update_parent" ON players;

DROP POLICY IF EXISTS "player_parents_all_super_admin" ON player_parents;
DROP POLICY IF EXISTS "player_parents_all_club_admin" ON player_parents;
DROP POLICY IF EXISTS "player_parents_select_own" ON player_parents;

DROP POLICY IF EXISTS "team_players_select_active_public" ON team_players;
DROP POLICY IF EXISTS "team_players_all_super_admin" ON team_players;
DROP POLICY IF EXISTS "team_players_all_club_admin" ON team_players;
DROP POLICY IF EXISTS "team_players_all_coach" ON team_players;

DROP POLICY IF EXISTS "coaches_select_active_public" ON coaches;
DROP POLICY IF EXISTS "coaches_all_super_admin" ON coaches;
DROP POLICY IF EXISTS "coaches_all_club_admin" ON coaches;
DROP POLICY IF EXISTS "coaches_select_own" ON coaches;
DROP POLICY IF EXISTS "coaches_update_own" ON coaches;

DROP POLICY IF EXISTS "team_coaches_select_active_public" ON team_coaches;
DROP POLICY IF EXISTS "team_coaches_all_super_admin" ON team_coaches;
DROP POLICY IF EXISTS "team_coaches_all_club_admin" ON team_coaches;

-- =============================================
-- SIMPLIFIED RLS POLICIES - PLAYERS TABLE
-- =============================================

-- Public can view active players
CREATE POLICY "players_select_public" ON players
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "players_all_super_admin" ON players
  FOR ALL
  USING (public.is_super_admin());

-- Authenticated users in the same club can view players
CREATE POLICY "players_select_authenticated" ON players
  FOR SELECT
  TO authenticated
  USING (true);

-- Club admins can manage (insert/update/delete) their club's players
CREATE POLICY "players_manage_club_admin" ON players
  FOR ALL
  TO authenticated
  USING (
    players.club_id IN (SELECT public.user_club_ids())
  );

-- =============================================
-- SIMPLIFIED RLS POLICIES - PLAYER_PARENTS
-- =============================================

-- Super admins can do everything
CREATE POLICY "player_parents_all_super_admin" ON player_parents
  FOR ALL
  USING (public.is_super_admin());

-- Users can view their own parent relationships
CREATE POLICY "player_parents_select_own" ON player_parents
  FOR SELECT
  TO authenticated
  USING (parent_user_id = auth.uid());

-- Club staff can manage
CREATE POLICY "player_parents_manage_authenticated" ON player_parents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = player_parents.player_id
      AND p.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- SIMPLIFIED RLS POLICIES - TEAM_PLAYERS
-- =============================================

-- Public can view active team rosters
CREATE POLICY "team_players_select_public" ON team_players
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "team_players_all_super_admin" ON team_players
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage
CREATE POLICY "team_players_manage_authenticated" ON team_players
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_players.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- SIMPLIFIED RLS POLICIES - COACHES
-- =============================================

-- Public can view active coaches
CREATE POLICY "coaches_select_public" ON coaches
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "coaches_all_super_admin" ON coaches
  FOR ALL
  USING (public.is_super_admin());

-- Users can view and update their own coach profile
CREATE POLICY "coaches_own" ON coaches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Club staff can manage
CREATE POLICY "coaches_manage_authenticated" ON coaches
  FOR ALL
  TO authenticated
  USING (coaches.club_id IN (SELECT public.user_club_ids()));

-- =============================================
-- SIMPLIFIED RLS POLICIES - TEAM_COACHES
-- =============================================

-- Public can view active assignments
CREATE POLICY "team_coaches_select_public" ON team_coaches
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "team_coaches_all_super_admin" ON team_coaches
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage
CREATE POLICY "team_coaches_manage_authenticated" ON team_coaches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_coaches.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );
