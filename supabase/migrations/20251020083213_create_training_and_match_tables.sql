-- =============================================
-- PHASE 1.3: TRAINING & MATCHES TABLES
-- =============================================

-- =============================================
-- TRAINING RECURRENCES TABLE
-- =============================================
-- Defines recurring training patterns (e.g., "Every Monday and Wednesday at 5pm")
CREATE TABLE training_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_recurrences_team ON training_recurrences(team_id);

-- =============================================
-- TRAINING SESSIONS TABLE
-- =============================================
-- Individual training session instances
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  recurrence_id UUID REFERENCES training_recurrences(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location TEXT,
  focus_areas TEXT[], -- e.g., ['passing', 'shooting', 'conditioning']
  notes TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_sessions_team ON training_sessions(team_id);
CREATE INDEX idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_training_sessions_recurrence ON training_sessions(recurrence_id);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
-- Track player attendance at training sessions
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'injured')),
  arrival_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(training_session_id, player_id)
);

CREATE INDEX idx_attendance_session ON attendance(training_session_id);
CREATE INDEX idx_attendance_player ON attendance(player_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- =============================================
-- MATCHES TABLE
-- =============================================
-- Match/game details
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID, -- Can be null for friendly matches against external teams
  away_team_name TEXT, -- Store external team name if away_team_id is null
  match_date DATE NOT NULL,
  start_time TIME NOT NULL,
  location TEXT NOT NULL,
  competition TEXT, -- e.g., 'League', 'Cup', 'Friendly'
  home_score INTEGER CHECK (home_score >= 0),
  away_score INTEGER CHECK (away_score >= 0),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'postponed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT matches_away_team_check CHECK (
    (away_team_id IS NOT NULL AND away_team_name IS NULL) OR
    (away_team_id IS NULL AND away_team_name IS NOT NULL)
  )
);

CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- =============================================
-- MATCH SQUADS TABLE
-- =============================================
-- Players selected for each match
CREATE TABLE match_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_starting BOOLEAN NOT NULL DEFAULT false,
  jersey_number INTEGER CHECK (jersey_number > 0 AND jersey_number <= 99),
  position TEXT,
  minutes_played INTEGER CHECK (minutes_played >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

CREATE INDEX idx_match_squads_match ON match_squads(match_id);
CREATE INDEX idx_match_squads_player ON match_squads(player_id);

-- =============================================
-- MATCH STATISTICS TABLE
-- =============================================
-- Individual player statistics per match
CREATE TABLE match_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  yellow_cards INTEGER NOT NULL DEFAULT 0 CHECK (yellow_cards >= 0),
  red_cards INTEGER NOT NULL DEFAULT 0 CHECK (red_cards >= 0 AND red_cards <= 1),
  saves INTEGER CHECK (saves >= 0), -- For goalkeepers
  shots_on_target INTEGER CHECK (shots_on_target >= 0),
  passes_completed INTEGER CHECK (passes_completed >= 0),
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10), -- Player rating 0-10
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

CREATE INDEX idx_match_statistics_match ON match_statistics(match_id);
CREATE INDEX idx_match_statistics_player ON match_statistics(player_id);

-- =============================================
-- RLS POLICIES - TRAINING RECURRENCES
-- =============================================

ALTER TABLE training_recurrences ENABLE ROW LEVEL SECURITY;

-- Public can view active recurrences
CREATE POLICY "training_recurrences_select_public" ON training_recurrences
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "training_recurrences_all_super_admin" ON training_recurrences
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage their teams' recurrences
CREATE POLICY "training_recurrences_manage_authenticated" ON training_recurrences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = training_recurrences.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - TRAINING SESSIONS
-- =============================================

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Public can view non-cancelled sessions
CREATE POLICY "training_sessions_select_public" ON training_sessions
  FOR SELECT
  USING (is_cancelled = false);

-- Super admins can do everything
CREATE POLICY "training_sessions_all_super_admin" ON training_sessions
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage their teams' sessions
CREATE POLICY "training_sessions_manage_authenticated" ON training_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = training_sessions.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - ATTENDANCE
-- =============================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "attendance_all_super_admin" ON attendance
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage attendance for their teams
CREATE POLICY "attendance_manage_authenticated" ON attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions ts
      JOIN teams t ON t.id = ts.team_id
      WHERE ts.id = attendance.training_session_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- Players and parents can view their own attendance
CREATE POLICY "attendance_select_own" ON attendance
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT p.id FROM players p
      LEFT JOIN player_parents pp ON pp.player_id = p.id
      WHERE p.id = player_id OR pp.parent_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - MATCHES
-- =============================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Public can view completed matches
CREATE POLICY "matches_select_public" ON matches
  FOR SELECT
  USING (status = 'completed');

-- Super admins can do everything
CREATE POLICY "matches_all_super_admin" ON matches
  FOR ALL
  USING (public.is_super_admin());

-- Authenticated users can view all matches
CREATE POLICY "matches_select_authenticated" ON matches
  FOR SELECT
  TO authenticated
  USING (true);

-- Club staff can manage matches for their teams
CREATE POLICY "matches_manage_authenticated" ON matches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE (t.id = matches.home_team_id OR t.id = matches.away_team_id)
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - MATCH SQUADS
-- =============================================

ALTER TABLE match_squads ENABLE ROW LEVEL SECURITY;

-- Public can view squads for completed matches
CREATE POLICY "match_squads_select_public" ON match_squads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_squads.match_id
      AND m.status = 'completed'
    )
  );

-- Super admins can do everything
CREATE POLICY "match_squads_all_super_admin" ON match_squads
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage squads for their teams' matches
CREATE POLICY "match_squads_manage_authenticated" ON match_squads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN teams t ON (t.id = m.home_team_id OR t.id = m.away_team_id)
      WHERE m.id = match_squads.match_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - MATCH STATISTICS
-- =============================================

ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;

-- Public can view statistics for completed matches
CREATE POLICY "match_statistics_select_public" ON match_statistics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_statistics.match_id
      AND m.status = 'completed'
    )
  );

-- Super admins can do everything
CREATE POLICY "match_statistics_all_super_admin" ON match_statistics
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage statistics for their teams' matches
CREATE POLICY "match_statistics_manage_authenticated" ON match_statistics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN teams t ON (t.id = m.home_team_id OR t.id = m.away_team_id)
      WHERE m.id = match_statistics.match_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_training_recurrences_updated_at
  BEFORE UPDATE ON training_recurrences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_statistics_updated_at
  BEFORE UPDATE ON match_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
