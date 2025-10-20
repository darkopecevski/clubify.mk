-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'club_admin', 'coach', 'parent', 'player');

-- =============================================
-- USERS TABLE (extends auth.users)
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_full_name ON users(full_name);

-- =============================================
-- CLUBS TABLE
-- =============================================
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT clubs_name_min_length CHECK (char_length(name) >= 2),
  CONSTRAINT clubs_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT clubs_email_format CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_is_active ON clubs(is_active);

-- =============================================
-- USER_ROLES TABLE (multi-tenant permissions)
-- =============================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  -- Super admins don't need a club_id, all other roles do
  CONSTRAINT user_roles_club_required CHECK (
    (role = 'super_admin' AND club_id IS NULL) OR
    (role != 'super_admin' AND club_id IS NOT NULL)
  ),
  -- One user can have only one role per club
  CONSTRAINT user_roles_unique_per_club UNIQUE (user_id, club_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_club_id ON user_roles(club_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- =============================================
-- TEAMS TABLE
-- =============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  season TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT teams_name_min_length CHECK (char_length(name) >= 2),
  CONSTRAINT teams_age_group_min_length CHECK (char_length(age_group) >= 2)
);

-- Indexes
CREATE INDEX idx_teams_club_id ON teams(club_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - USERS TABLE
-- =============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Super admins can view all users
CREATE POLICY "users_select_super_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Club admins can view users in their club
CREATE POLICY "users_select_club_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur1
      WHERE ur1.user_id = auth.uid()
      AND ur1.role = 'club_admin'
      AND EXISTS (
        SELECT 1 FROM user_roles ur2
        WHERE ur2.user_id = users.id
        AND ur2.club_id = ur1.club_id
      )
    )
  );

-- =============================================
-- RLS POLICIES - CLUBS TABLE
-- =============================================

-- Anyone can view active clubs (for public pages)
CREATE POLICY "clubs_select_active_public" ON clubs
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "clubs_all_super_admin" ON clubs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Club admins can update their own club
CREATE POLICY "clubs_update_club_admin" ON clubs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND club_id = clubs.id
      AND role = 'club_admin'
    )
  );

-- =============================================
-- RLS POLICIES - USER_ROLES TABLE
-- =============================================

-- Users can view their own roles
CREATE POLICY "user_roles_select_own" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can do everything
CREATE POLICY "user_roles_all_super_admin" ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Club admins can view roles in their club
CREATE POLICY "user_roles_select_club_admin" ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.club_id = user_roles.club_id
      AND ur.role = 'club_admin'
    )
  );

-- Club admins can insert roles in their club (but not club_admin or super_admin)
CREATE POLICY "user_roles_insert_club_admin" ON user_roles
  FOR INSERT
  WITH CHECK (
    role NOT IN ('club_admin', 'super_admin')
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.club_id = user_roles.club_id
      AND ur.role = 'club_admin'
    )
  );

-- Club admins can delete non-admin roles in their club
CREATE POLICY "user_roles_delete_club_admin" ON user_roles
  FOR DELETE
  USING (
    role NOT IN ('club_admin', 'super_admin')
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.club_id = user_roles.club_id
      AND ur.role = 'club_admin'
    )
  );

-- =============================================
-- RLS POLICIES - TEAMS TABLE
-- =============================================

-- Anyone can view active teams (for public pages)
CREATE POLICY "teams_select_active_public" ON teams
  FOR SELECT
  USING (is_active = true);

-- Super admins can do everything
CREATE POLICY "teams_all_super_admin" ON teams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Club admins can do everything for their club's teams
CREATE POLICY "teams_all_club_admin" ON teams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND club_id = teams.club_id
      AND role = 'club_admin'
    )
  );

-- Coaches can view their club's teams
CREATE POLICY "teams_select_coach" ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND club_id = teams.club_id
      AND role = 'coach'
    )
  );
