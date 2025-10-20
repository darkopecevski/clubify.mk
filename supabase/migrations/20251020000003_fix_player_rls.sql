-- Drop problematic policies
DROP POLICY IF EXISTS "players_all_club_admin" ON players;
DROP POLICY IF EXISTS "players_select_coach" ON players;
DROP POLICY IF EXISTS "team_players_all_coach" ON team_players;

-- =============================================
-- FIXED RLS POLICIES - PLAYERS TABLE
-- =============================================

-- Club admins can do everything for their club's players (fixed)
CREATE POLICY "players_all_club_admin" ON players
  FOR ALL
  USING (
    players.club_id IN (SELECT public.user_club_ids())
  );

-- Coaches can view their club's players (fixed)
CREATE POLICY "players_select_coach" ON players
  FOR SELECT
  USING (
    players.club_id IN (SELECT public.user_club_ids())
  );

-- =============================================
-- FIXED RLS POLICIES - TEAM_PLAYERS TABLE
-- =============================================

-- Coaches can manage their team rosters (fixed - simpler approach)
CREATE POLICY "team_players_all_coach" ON team_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_players.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );
