-- =============================================
-- PLAYERS TABLE
-- =============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),

  -- Football-specific info
  position TEXT,
  dominant_foot TEXT CHECK (dominant_foot IN ('left', 'right', 'both')),
  jersey_number INTEGER CHECK (jersey_number > 0 AND jersey_number <= 99),

  -- Medical info
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  medical_conditions TEXT,
  allergies TEXT,

  -- Emergency contact
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,

  -- Additional info
  photo_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT players_first_name_min_length CHECK (char_length(first_name) >= 2),
  CONSTRAINT players_last_name_min_length CHECK (char_length(last_name) >= 2),
  CONSTRAINT players_age_check CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '4 years'),
  CONSTRAINT players_emergency_phone_format CHECK (char_length(emergency_contact_phone) >= 8)
);

-- Indexes
CREATE INDEX idx_players_club_id ON players(club_id);
CREATE INDEX idx_players_is_active ON players(is_active);
CREATE INDEX idx_players_last_name ON players(last_name);
CREATE INDEX idx_players_date_of_birth ON players(date_of_birth);

-- =============================================
-- PLAYER_PARENTS TABLE (many-to-many)
-- =============================================
CREATE TABLE player_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('mother', 'father', 'guardian', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One parent can have multiple players, one player can have multiple parents
  CONSTRAINT player_parents_unique UNIQUE (player_id, parent_user_id)
);

-- Indexes
CREATE INDEX idx_player_parents_player_id ON player_parents(player_id);
CREATE INDEX idx_player_parents_parent_user_id ON player_parents(parent_user_id);

-- =============================================
-- TEAM_PLAYERS TABLE (many-to-many)
-- =============================================
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A player can only be in a team once at a time
  CONSTRAINT team_players_unique UNIQUE (team_id, player_id),
  -- Left date must be after joined date
  CONSTRAINT team_players_date_order CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- Indexes
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);
CREATE INDEX idx_team_players_is_active ON team_players(is_active);

-- =============================================
-- COACHES TABLE
-- =============================================
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Coach details
  license_type TEXT,
  license_number TEXT,
  specialization TEXT,
  years_of_experience INTEGER CHECK (years_of_experience >= 0),

  -- Additional info
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One user can only be a coach once per club
  CONSTRAINT coaches_unique_per_club UNIQUE (club_id, user_id)
);

-- Indexes
CREATE INDEX idx_coaches_club_id ON coaches(club_id);
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
CREATE INDEX idx_coaches_is_active ON coaches(is_active);

-- =============================================
-- TEAM_COACHES TABLE (many-to-many)
-- =============================================
CREATE TABLE team_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'goalkeeper_coach', 'fitness_coach', 'other')),
  assigned_at DATE NOT NULL DEFAULT CURRENT_DATE,
  removed_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A coach can have only one active role per team
  CONSTRAINT team_coaches_unique UNIQUE (team_id, coach_id),
  -- Removed date must be after assigned date
  CONSTRAINT team_coaches_date_order CHECK (removed_at IS NULL OR removed_at >= assigned_at)
);

-- Indexes
CREATE INDEX idx_team_coaches_team_id ON team_coaches(team_id);
CREATE INDEX idx_team_coaches_coach_id ON team_coaches(coach_id);
CREATE INDEX idx_team_coaches_is_active ON team_coaches(is_active);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at for players
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for coaches
CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_coaches ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PLAYERS TABLE
-- =============================================

-- Anyone can view active players (for public pages)
CREATE POLICY "players_select_active_public" ON players
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "players_all_super_admin" ON players
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can do everything for their club's players
CREATE POLICY "players_all_club_admin" ON players
  FOR ALL
  USING (
    players.club_id IN (SELECT public.user_club_ids())
    AND public.user_has_club_role('club_admin', players.club_id)
  );

-- Coaches can view their club's players
CREATE POLICY "players_select_coach" ON players
  FOR SELECT
  USING (players.club_id IN (SELECT public.user_club_ids()));

-- Parents can view their own children
CREATE POLICY "players_select_parent" ON players
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_parents pp
      WHERE pp.player_id = players.id
      AND pp.parent_user_id = auth.uid()
    )
  );

-- Parents can update their own children's info
CREATE POLICY "players_update_parent" ON players
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM player_parents pp
      WHERE pp.player_id = players.id
      AND pp.parent_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - PLAYER_PARENTS TABLE
-- =============================================

-- Super admins can do everything
CREATE POLICY "player_parents_all_super_admin" ON player_parents
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can manage player-parent relationships in their club
CREATE POLICY "player_parents_all_club_admin" ON player_parents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = player_parents.player_id
      AND p.club_id IN (SELECT public.user_club_ids())
      AND public.user_has_club_role('club_admin', p.club_id)
    )
  );

-- Parents can view their own relationships
CREATE POLICY "player_parents_select_own" ON player_parents
  FOR SELECT
  USING (parent_user_id = auth.uid());

-- =============================================
-- RLS POLICIES - TEAM_PLAYERS TABLE
-- =============================================

-- Anyone can view active team rosters
CREATE POLICY "team_players_select_active_public" ON team_players
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "team_players_all_super_admin" ON team_players
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can manage team rosters in their club
CREATE POLICY "team_players_all_club_admin" ON team_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_players.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
      AND public.user_has_club_role('club_admin', t.club_id)
    )
  );

-- Coaches can manage their team rosters
CREATE POLICY "team_players_all_coach" ON team_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_coaches tc
      JOIN coaches c ON c.id = tc.coach_id
      WHERE tc.team_id = team_players.team_id
      AND c.user_id = auth.uid()
      AND tc.is_active = true
    )
  );

-- =============================================
-- RLS POLICIES - COACHES TABLE
-- =============================================

-- Anyone can view active coaches
CREATE POLICY "coaches_select_active_public" ON coaches
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "coaches_all_super_admin" ON coaches
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can manage coaches in their club
CREATE POLICY "coaches_all_club_admin" ON coaches
  FOR ALL
  USING (
    coaches.club_id IN (SELECT public.user_club_ids())
    AND public.user_has_club_role('club_admin', coaches.club_id)
  );

-- Coaches can view and update their own profile
CREATE POLICY "coaches_select_own" ON coaches
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "coaches_update_own" ON coaches
  FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES - TEAM_COACHES TABLE
-- =============================================

-- Anyone can view active coach assignments
CREATE POLICY "team_coaches_select_active_public" ON team_coaches
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "team_coaches_all_super_admin" ON team_coaches
  FOR ALL
  USING (public.is_super_admin());

-- Club admins can manage coach assignments in their club
CREATE POLICY "team_coaches_all_club_admin" ON team_coaches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_coaches.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
      AND public.user_has_club_role('club_admin', t.club_id)
    )
  );
