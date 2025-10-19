# Database Schema Design
## Clubify.mk - PostgreSQL Schema

### Version 1.0
**Last Updated:** 2025-10-18

---

## 1. Schema Overview

This document defines the complete PostgreSQL database schema for Clubify.mk, including tables, relationships, indexes, and Row Level Security (RLS) policies.

### 1.1 Database Conventions

**Naming Conventions:**
- Tables: `snake_case`, plural (e.g., `players`, `training_sessions`)
- Columns: `snake_case` (e.g., `first_name`, `created_at`)
- Foreign keys: `{table}_id` (e.g., `club_id`, `player_id`)
- Indexes: `idx_{table}_{column(s)}` (e.g., `idx_players_club_id`)
- RLS Policies: `{action}_{role}_{table}` (e.g., `select_parent_players`)

**Standard Columns (all tables):**
```sql
id            UUID PRIMARY KEY DEFAULT uuid_generate_v4()
created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Soft Delete Pattern:**
```sql
deleted_at    TIMESTAMP WITH TIME ZONE  -- NULL = active, NOT NULL = deleted
is_active     BOOLEAN DEFAULT true       -- For entities that can be deactivated
```

---

## 2. Core Tables

### 2.1 Users Table

Stores all user accounts (mapped to Supabase Auth).

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT UNIQUE NOT NULL,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  avatar_url        TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'mk', 'sq')),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at     TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Notes:**
- `id` references Supabase Auth `auth.users`
- Email is unique across the platform
- `preferred_language` for UI localization

---

### 2.2 User Roles Table

Maps users to their roles (many-to-many: one user can have multiple roles).

```sql
CREATE TYPE user_role_enum AS ENUM (
  'super_admin',
  'club_admin',
  'coach',
  'parent',
  'player'
);

CREATE TABLE user_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            user_role_enum NOT NULL,
  club_id         UUID REFERENCES clubs(id) ON DELETE CASCADE,  -- NULL for super_admin
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, role, club_id),  -- Can't have same role twice in same club
  CHECK (
    (role = 'super_admin' AND club_id IS NULL) OR
    (role != 'super_admin' AND club_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_club_id ON user_roles(club_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

**Notes:**
- Super admin role has NULL `club_id` (platform-wide)
- All other roles must have a `club_id`
- A user can have multiple roles (e.g., parent + coach)

---

### 2.3 Clubs Table

```sql
CREATE TABLE clubs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,  -- For subdomain: slug.clubify.mk
  description       TEXT,
  logo_url          TEXT,
  email             TEXT,
  phone             TEXT,
  address           TEXT,
  website_url       TEXT,
  facebook_url      TEXT,
  instagram_url     TEXT,
  twitter_url       TEXT,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_is_active ON clubs(is_active);
```

**Notes:**
- `slug` used for subdomain routing (e.g., `vardar.clubify.mk`)
- Slug must be URL-safe (lowercase, alphanumeric, hyphens)

---

### 2.4 Teams Table

```sql
CREATE TYPE age_group_enum AS ENUM (
  'U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U20'
);

CREATE TABLE teams (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id               UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,  -- e.g., "U12 Red", "U14 Elite"
  age_group             age_group_enum NOT NULL,
  season_year           INTEGER NOT NULL,  -- e.g., 2024
  description           TEXT,
  photo_url             TEXT,
  monthly_fee           DECIMAL(10, 2),  -- Subscription fee (MKD)
  is_active             BOOLEAN DEFAULT true,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(club_id, name, season_year)
);

-- Indexes
CREATE INDEX idx_teams_club_id ON teams(club_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);
CREATE INDEX idx_teams_season_year ON teams(season_year);
```

---

### 2.5 Players Table

```sql
CREATE TYPE player_position_enum AS ENUM (
  'goalkeeper',
  'defender',
  'midfielder',
  'forward'
);

CREATE TYPE dominant_foot_enum AS ENUM ('left', 'right', 'both');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

CREATE TABLE players (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,  -- Player's login
  club_id                   UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,

  -- Personal Information
  first_name                TEXT NOT NULL,
  last_name                 TEXT NOT NULL,
  birthdate                 DATE NOT NULL,
  gender                    gender_enum NOT NULL,
  photo_url                 TEXT,
  nationality               TEXT,
  address                   TEXT,

  -- Football Information
  position                  player_position_enum NOT NULL,
  dominant_foot             dominant_foot_enum NOT NULL,
  jersey_number             INTEGER,
  height_cm                 INTEGER,
  weight_kg                 DECIMAL(5, 2),

  -- Emergency Contact
  emergency_contact_name    TEXT NOT NULL,
  emergency_contact_phone   TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,

  -- Medical Information (encrypted)
  medical_conditions        TEXT,
  allergies                 TEXT,
  blood_type                blood_type_enum,
  medications               TEXT,
  doctor_name               TEXT,
  doctor_phone              TEXT,

  -- Status
  is_active                 BOOLEAN DEFAULT true,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (birthdate < CURRENT_DATE),
  CHECK (birthdate > CURRENT_DATE - INTERVAL '21 years'),  -- Max age 21
  CHECK (jersey_number BETWEEN 1 AND 99)
);

-- Indexes
CREATE INDEX idx_players_club_id ON players(club_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_last_name ON players(last_name);
CREATE INDEX idx_players_is_active ON players(is_active);
```

**Notes:**
- Medical information should be encrypted (use pgcrypto)
- Jersey number unique per team (enforced at application level or trigger)

---

### 2.6 Player Parents Table

Links players to their parents (many-to-many).

```sql
CREATE TABLE player_parents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  parent_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship    TEXT NOT NULL,  -- e.g., "Mother", "Father", "Guardian"
  is_primary      BOOLEAN DEFAULT false,  -- Primary contact
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(player_id, parent_user_id)
);

-- Indexes
CREATE INDEX idx_player_parents_player_id ON player_parents(player_id);
CREATE INDEX idx_player_parents_parent_user_id ON player_parents(parent_user_id);
```

---

### 2.7 Team Players Table

Links players to teams (many-to-many: players can be on multiple teams).

```sql
CREATE TABLE team_players (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  jersey_number   INTEGER CHECK (jersey_number BETWEEN 1 AND 99),
  joined_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at         TIMESTAMP WITH TIME ZONE,  -- NULL = still on team

  UNIQUE(team_id, player_id),
  UNIQUE(team_id, jersey_number) WHERE left_at IS NULL  -- Jersey unique per active player
);

-- Indexes
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);
```

---

### 2.8 Coaches Table

```sql
CREATE TABLE coaches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  bio               TEXT,
  photo_url         TEXT,
  certifications    JSONB DEFAULT '[]'::jsonb,  -- Array of certifications
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coaches_club_id ON coaches(club_id);
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
```

**Notes:**
- `certifications` stored as JSONB array: `[{"name": "UEFA A", "date": "2020-05-15"}]`

---

### 2.9 Team Coaches Table

Links coaches to teams (many-to-many).

```sql
CREATE TABLE team_coaches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  is_head_coach   BOOLEAN DEFAULT false,  -- Head coach vs assistant
  assigned_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(team_id, coach_id)
);

-- Indexes
CREATE INDEX idx_team_coaches_team_id ON team_coaches(team_id);
CREATE INDEX idx_team_coaches_coach_id ON team_coaches(coach_id);
```

---

## 3. Training & Attendance Tables

### 3.1 Training Sessions Table

```sql
CREATE TYPE training_session_status_enum AS ENUM (
  'scheduled',
  'completed',
  'cancelled'
);

CREATE TABLE training_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id          UUID NOT NULL REFERENCES coaches(id),

  session_date      DATE NOT NULL,
  start_time        TIME NOT NULL,
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes BETWEEN 30 AND 240),
  location          TEXT NOT NULL,
  notes             TEXT,

  status            training_session_status_enum DEFAULT 'scheduled',
  cancellation_reason TEXT,

  -- Recurrence (if part of recurring schedule)
  recurrence_id     UUID,  -- Links to recurrence pattern

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_training_sessions_team_id ON training_sessions(team_id);
CREATE INDEX idx_training_sessions_coach_id ON training_sessions(coach_id);
CREATE INDEX idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);
```

---

### 3.2 Training Recurrence Table

Stores recurring training patterns.

```sql
CREATE TYPE day_of_week_enum AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
);

CREATE TABLE training_recurrences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id          UUID NOT NULL REFERENCES coaches(id),

  days_of_week      day_of_week_enum[] NOT NULL,  -- Array: ['monday', 'wednesday']
  start_time        TIME NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  location          TEXT NOT NULL,
  notes             TEXT,

  start_date        DATE NOT NULL,
  end_date          DATE,  -- NULL = indefinite

  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_training_recurrences_team_id ON training_recurrences(team_id);
```

**Notes:**
- Training sessions are generated from recurrence patterns
- Use a cron job or Edge Function to create upcoming sessions

---

### 3.3 Attendance Table

```sql
CREATE TYPE attendance_status_enum AS ENUM (
  'present',
  'absent',
  'excused',
  'late'
);

CREATE TABLE attendance (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status            attendance_status_enum NOT NULL,
  notes             TEXT,
  marked_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marked_by_coach_id UUID REFERENCES coaches(id),

  UNIQUE(training_session_id, player_id)
);

-- Indexes
CREATE INDEX idx_attendance_training_session_id ON attendance(training_session_id);
CREATE INDEX idx_attendance_player_id ON attendance(player_id);
CREATE INDEX idx_attendance_status ON attendance(status);
```

---

## 4. Match Tables

### 4.1 Matches Table

```sql
CREATE TYPE match_type_enum AS ENUM ('friendly', 'league', 'tournament');
CREATE TYPE match_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE match_result_enum AS ENUM ('win', 'loss', 'draw');
CREATE TYPE home_away_enum AS ENUM ('home', 'away');

CREATE TABLE matches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id            UUID NOT NULL REFERENCES coaches(id),

  match_date          TIMESTAMP WITH TIME ZONE NOT NULL,
  opponent_name       TEXT NOT NULL,  -- Opponent club/team name
  venue               TEXT NOT NULL,
  home_away           home_away_enum NOT NULL,

  match_type          match_type_enum NOT NULL,
  competition_name    TEXT,  -- Required if type = tournament

  status              match_status_enum DEFAULT 'scheduled',

  -- Results (filled after match)
  own_score           INTEGER CHECK (own_score >= 0),
  opponent_score      INTEGER CHECK (opponent_score >= 0),
  result              match_result_enum,  -- Calculated from scores

  match_report        TEXT,  -- Post-match notes
  mvp_player_id       UUID REFERENCES players(id),

  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (
    (match_type = 'tournament' AND competition_name IS NOT NULL) OR
    (match_type != 'tournament')
  )
);

-- Indexes
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_matches_coach_id ON matches(coach_id);
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
```

---

### 4.2 Match Squads Table

Players selected for a match.

```sql
CREATE TABLE match_squads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id          UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_starting       BOOLEAN DEFAULT false,  -- Starting 11 vs substitute
  position          TEXT,  -- Position on field (e.g., "CB", "ST")
  selected_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(match_id, player_id)
);

-- Indexes
CREATE INDEX idx_match_squads_match_id ON match_squads(match_id);
CREATE INDEX idx_match_squads_player_id ON match_squads(player_id);
```

---

### 4.3 Match Statistics Table

Player performance in a match.

```sql
CREATE TABLE match_statistics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id          UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  goals             INTEGER DEFAULT 0 CHECK (goals >= 0),
  assists           INTEGER DEFAULT 0 CHECK (assists >= 0),
  yellow_cards      INTEGER DEFAULT 0 CHECK (yellow_cards >= 0),
  red_cards         INTEGER DEFAULT 0 CHECK (red_cards >= 0 AND red_cards <= 1),
  minutes_played    INTEGER DEFAULT 0 CHECK (minutes_played BETWEEN 0 AND 120),
  player_rating     DECIMAL(3, 1) CHECK (player_rating BETWEEN 1.0 AND 10.0),  -- Optional

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(match_id, player_id)
);

-- Indexes
CREATE INDEX idx_match_statistics_match_id ON match_statistics(match_id);
CREATE INDEX idx_match_statistics_player_id ON match_statistics(player_id);
```

---

## 5. Payment Tables

### 5.1 Subscription Fees Table

Historical record of team subscription fees.

```sql
CREATE TABLE subscription_fees (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  monthly_amount    DECIMAL(10, 2) NOT NULL CHECK (monthly_amount >= 0),
  currency          TEXT DEFAULT 'MKD',
  effective_date    DATE NOT NULL,
  end_date          DATE,  -- NULL = current fee
  notes             TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_fees_team_id ON subscription_fees(team_id);
CREATE INDEX idx_subscription_fees_effective_date ON subscription_fees(effective_date);
```

---

### 5.2 Discounts Table

```sql
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE discount_reason_enum AS ENUM ('sibling', 'financial_hardship', 'merit', 'other');

CREATE TABLE discounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  discount_type     discount_type_enum NOT NULL,
  discount_value    DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
  reason            discount_reason_enum NOT NULL,
  custom_reason     TEXT,  -- Required if reason = 'other'
  effective_date    DATE NOT NULL,
  end_date          DATE,
  created_by_user_id UUID REFERENCES users(id),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (
    (reason = 'other' AND custom_reason IS NOT NULL) OR
    (reason != 'other')
  )
);

-- Indexes
CREATE INDEX idx_discounts_player_id ON discounts(player_id);
CREATE INDEX idx_discounts_effective_date ON discounts(effective_date);
```

---

### 5.3 Payment Records Table

```sql
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'overdue');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'bank_transfer', 'online', 'other');

CREATE TABLE payment_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  month             INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              INTEGER NOT NULL,

  amount_due        DECIMAL(10, 2) NOT NULL CHECK (amount_due >= 0),
  discount_applied  DECIMAL(10, 2) DEFAULT 0 CHECK (discount_applied >= 0),
  final_amount      DECIMAL(10, 2) NOT NULL CHECK (final_amount >= 0),

  status            payment_status_enum DEFAULT 'unpaid',
  payment_date      DATE,
  payment_method    payment_method_enum,
  notes             TEXT,

  due_date          DATE NOT NULL,
  marked_paid_by_user_id UUID REFERENCES users(id),

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(player_id, team_id, month, year)
);

-- Indexes
CREATE INDEX idx_payment_records_player_id ON payment_records(player_id);
CREATE INDEX idx_payment_records_team_id ON payment_records(team_id);
CREATE INDEX idx_payment_records_status ON payment_records(status);
CREATE INDEX idx_payment_records_year_month ON payment_records(year, month);
CREATE INDEX idx_payment_records_due_date ON payment_records(due_date);
```

**Notes:**
- Auto-generated on 1st of each month for active players
- `final_amount = amount_due - discount_applied`
- Status auto-updates to 'overdue' if unpaid past due date

---

## 6. Content Tables

### 6.1 Announcements Table

```sql
CREATE TYPE announcement_visibility_enum AS ENUM ('public', 'members_only');
CREATE TYPE announcement_status_enum AS ENUM ('draft', 'scheduled', 'published', 'archived');

CREATE TABLE announcements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  author_user_id    UUID NOT NULL REFERENCES users(id),

  title             TEXT NOT NULL,
  content           TEXT NOT NULL,  -- Rich text (HTML or Markdown)
  featured_image_url TEXT,

  visibility        announcement_visibility_enum DEFAULT 'members_only',
  status            announcement_status_enum DEFAULT 'draft',

  publish_date      TIMESTAMP WITH TIME ZONE,
  target_teams      UUID[],  -- Array of team IDs, NULL = all teams

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_announcements_club_id ON announcements(club_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_publish_date ON announcements(publish_date);
```

---

### 6.2 Media Gallery Table

```sql
CREATE TYPE media_type_enum AS ENUM ('image', 'video');

CREATE TABLE media_gallery (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),

  media_type        media_type_enum NOT NULL,
  file_url          TEXT NOT NULL,
  thumbnail_url     TEXT,

  caption           TEXT,
  album_name        TEXT,  -- e.g., "U12 Tournament 2024"

  visibility        announcement_visibility_enum DEFAULT 'public',

  uploaded_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_gallery_club_id ON media_gallery(club_id);
CREATE INDEX idx_media_gallery_album_name ON media_gallery(album_name);
CREATE INDEX idx_media_gallery_uploaded_at ON media_gallery(uploaded_at);
```

---

## 7. Notification Tables

### 7.1 Notifications Table

```sql
CREATE TYPE notification_type_enum AS ENUM (
  'training_created',
  'training_cancelled',
  'training_rescheduled',
  'match_created',
  'squad_selected',
  'match_result',
  'payment_reminder',
  'payment_overdue',
  'announcement',
  'player_assigned',
  'coach_assigned'
);

CREATE TYPE notification_priority_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_status_enum AS ENUM ('sent', 'read', 'deleted');

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  notification_type notification_type_enum NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  priority          notification_priority_enum DEFAULT 'medium',

  -- Linked entity (optional, for navigation)
  related_entity_type TEXT,  -- e.g., 'training_session', 'match', 'payment'
  related_entity_id   UUID,

  status            notification_status_enum DEFAULT 'sent',

  sent_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at           TIMESTAMP WITH TIME ZONE,
  deleted_at        TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
```

---

### 7.2 Notification Preferences Table

```sql
CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type_enum NOT NULL,

  in_app_enabled    BOOLEAN DEFAULT true,
  email_enabled     BOOLEAN DEFAULT true,
  sms_enabled       BOOLEAN DEFAULT false,  -- Future

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, notification_type)
);

-- Indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

---

## 8. Utility Functions

### 8.1 Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
-- Example:
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

### 8.2 Calculate Match Result Trigger

```sql
CREATE OR REPLACE FUNCTION calculate_match_result()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.own_score IS NOT NULL AND NEW.opponent_score IS NOT NULL THEN
    IF NEW.own_score > NEW.opponent_score THEN
      NEW.result = 'win';
    ELSIF NEW.own_score < NEW.opponent_score THEN
      NEW.result = 'loss';
    ELSE
      NEW.result = 'draw';
    END IF;
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_result
BEFORE UPDATE ON matches
FOR EACH ROW
WHEN (NEW.own_score IS DISTINCT FROM OLD.own_score OR NEW.opponent_score IS DISTINCT FROM OLD.opponent_score)
EXECUTE FUNCTION calculate_match_result();
```

---

### 8.3 Auto-Update Payment Status Trigger

```sql
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as overdue if past due date and unpaid
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'unpaid' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_payment_status
BEFORE UPDATE ON payment_records
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();
```

---

## 9. Row Level Security (RLS) Policies

### 9.1 Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)
```

---

### 9.2 Example RLS Policies

#### Super Admin (Full Access)

```sql
-- Super admins can see everything
CREATE POLICY "super_admin_all_access" ON clubs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
```

#### Club Admin (Club-Scoped)

```sql
-- Club admins can see their club's players
CREATE POLICY "club_admin_players_select" ON players
  FOR SELECT
  USING (
    club_id IN (
      SELECT club_id FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'club_admin'
    )
  );

-- Club admins can create players in their club
CREATE POLICY "club_admin_players_insert" ON players
  FOR INSERT
  WITH CHECK (
    club_id IN (
      SELECT club_id FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'club_admin'
    )
  );
```

#### Coach (Team-Scoped)

```sql
-- Coaches can see players in their teams
CREATE POLICY "coach_players_select" ON players
  FOR SELECT
  USING (
    id IN (
      SELECT player_id FROM team_players
      WHERE team_id IN (
        SELECT team_id FROM team_coaches
        JOIN coaches ON coaches.id = team_coaches.coach_id
        WHERE coaches.user_id = auth.uid()
      )
    )
  );
```

#### Parent (Own Children Only)

```sql
-- Parents can see their children
CREATE POLICY "parent_players_select" ON players
  FOR SELECT
  USING (
    id IN (
      SELECT player_id FROM player_parents
      WHERE parent_user_id = auth.uid()
    )
  );

-- Parents can update their children's info
CREATE POLICY "parent_players_update" ON players
  FOR UPDATE
  USING (
    id IN (
      SELECT player_id FROM player_parents
      WHERE parent_user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Cannot update football-specific fields
    position = OLD.position
    AND dominant_foot = OLD.dominant_foot
    AND jersey_number = OLD.jersey_number
  );
```

#### Player (Own Data Only)

```sql
-- Players can see their own data
CREATE POLICY "player_self_select" ON players
  FOR SELECT
  USING (user_id = auth.uid());
```

---

## 10. Indexes Summary

Key indexes for performance:

```sql
-- Foreign keys (always indexed)
CREATE INDEX ON table_name(foreign_key_id);

-- Frequently filtered columns
CREATE INDEX ON players(club_id, is_active);
CREATE INDEX ON matches(team_id, match_date);
CREATE INDEX ON payment_records(status, due_date);

-- Text search (future)
CREATE INDEX ON players USING gin(to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX ON announcements USING gin(to_tsvector('english', title || ' ' || content));
```

---

## 11. Database Migrations Strategy

### 11.1 Migration File Naming

```
YYYYMMDDHHMMSS_description.sql

Example:
20250118120000_create_clubs_table.sql
20250118120100_create_teams_table.sql
20250118120200_create_players_table.sql
```

### 11.2 Migration Best Practices

- One migration file per logical change
- Always reversible (include DOWN migration)
- Test on local/staging before production
- Backup before major migrations
- Never delete data (soft delete)

---

## 12. Initial Seed Data

```sql
-- Insert super admin user (to be created via Supabase Auth first)
INSERT INTO users (id, email, full_name) VALUES
  ('...uuid-from-auth...', 'admin@clubify.mk', 'Super Admin');

INSERT INTO user_roles (user_id, role, club_id) VALUES
  ('...uuid-from-auth...', 'super_admin', NULL);

-- Sample club
INSERT INTO clubs (name, slug, email) VALUES
  ('FK Vardar', 'vardar', 'contact@vardar.mk');
```

---

## Conclusion

This schema provides:
- ✅ Multi-tenancy with RLS isolation
- ✅ Role-based access control
- ✅ Comprehensive player/team/match tracking
- ✅ Payment tracking (ready for future online payments)
- ✅ Notification system
- ✅ Content management (announcements, media)
- ✅ Scalability (indexed, normalized)
- ✅ Data integrity (constraints, triggers)

Next steps:
1. Implement schema in Supabase
2. Generate TypeScript types
3. Write RLS policies for all tables
4. Create migration files
5. Seed test data

---
