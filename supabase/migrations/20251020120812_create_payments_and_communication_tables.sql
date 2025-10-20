-- =============================================
-- PHASE 1.4: PAYMENTS & COMMUNICATION TABLES
-- =============================================

-- =============================================
-- SUBSCRIPTION FEES TABLE
-- =============================================
-- Track monthly subscription fees per team (can change over time)
CREATE TABLE subscription_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'MKD',
  effective_from DATE NOT NULL,
  effective_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscription_fees_dates_check CHECK (effective_until IS NULL OR effective_until > effective_from)
);

CREATE INDEX idx_subscription_fees_team ON subscription_fees(team_id);
CREATE INDEX idx_subscription_fees_dates ON subscription_fees(effective_from, effective_until);

-- =============================================
-- DISCOUNTS TABLE
-- =============================================
-- Player-specific discounts (sibling, merit, hardship, etc.)
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
  reason TEXT NOT NULL CHECK (reason IN ('sibling', 'merit', 'hardship', 'loyalty', 'other')),
  description TEXT,
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT discounts_dates_check CHECK (effective_until IS NULL OR effective_until > effective_from),
  CONSTRAINT discounts_percentage_check CHECK (
    (discount_type = 'percentage' AND discount_value <= 100) OR
    discount_type = 'fixed_amount'
  )
);

CREATE INDEX idx_discounts_player ON discounts(player_id);
CREATE INDEX idx_discounts_dates ON discounts(effective_from, effective_until);
CREATE INDEX idx_discounts_active ON discounts(is_active);

-- =============================================
-- PAYMENT RECORDS TABLE
-- =============================================
-- Individual payment tracking per player per month
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2024),
  amount_due DECIMAL(10,2) NOT NULL CHECK (amount_due >= 0),
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  discount_applied DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_applied >= 0),
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue', 'waived')),
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'other')),
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, period_month, period_year)
);

CREATE INDEX idx_payment_records_player ON payment_records(player_id);
CREATE INDEX idx_payment_records_team ON payment_records(team_id);
CREATE INDEX idx_payment_records_period ON payment_records(period_year, period_month);
CREATE INDEX idx_payment_records_status ON payment_records(status);
CREATE INDEX idx_payment_records_due_date ON payment_records(due_date);

-- =============================================
-- ANNOUNCEMENTS TABLE
-- =============================================
-- Club news, updates, and announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'team_specific')),
  target_teams UUID[], -- Array of team IDs for team-specific announcements
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_club ON announcements(club_id);
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_visibility ON announcements(visibility);
CREATE INDEX idx_announcements_published ON announcements(published_at);

-- =============================================
-- MEDIA GALLERY TABLE
-- =============================================
-- Photos and videos organized by albums
CREATE TABLE media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  album_name TEXT,
  visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'team_specific')),
  target_teams UUID[], -- Array of team IDs for team-specific media
  file_size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- For videos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_gallery_club ON media_gallery(club_id);
CREATE INDEX idx_media_gallery_uploaded_by ON media_gallery(uploaded_by);
CREATE INDEX idx_media_gallery_album ON media_gallery(album_name);
CREATE INDEX idx_media_gallery_visibility ON media_gallery(visibility);
CREATE INDEX idx_media_gallery_type ON media_gallery(file_type);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
-- In-app notifications for users
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'training_created',
    'training_cancelled',
    'training_rescheduled',
    'match_created',
    'match_rescheduled',
    'squad_selected',
    'payment_due',
    'payment_overdue',
    'announcement_published',
    'general'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Deep link to relevant page
  related_entity_type TEXT, -- e.g., 'training_session', 'match', 'payment_record'
  related_entity_id UUID, -- ID of the related entity
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- NOTIFICATION PREFERENCES TABLE
-- =============================================
-- User preferences for notification delivery
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- =============================================
-- RLS POLICIES - SUBSCRIPTION FEES
-- =============================================

ALTER TABLE subscription_fees ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "subscription_fees_all_super_admin" ON subscription_fees
  FOR ALL
  USING (public.is_super_admin());

-- Authenticated users can view fees for their clubs
CREATE POLICY "subscription_fees_select_authenticated" ON subscription_fees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = subscription_fees.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- Club admins can manage fees
CREATE POLICY "subscription_fees_manage_club_admin" ON subscription_fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = subscription_fees.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - DISCOUNTS
-- =============================================

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "discounts_all_super_admin" ON discounts
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage discounts for their players
CREATE POLICY "discounts_manage_authenticated" ON discounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = discounts.player_id
      AND p.club_id IN (SELECT public.user_club_ids())
    )
  );

-- =============================================
-- RLS POLICIES - PAYMENT RECORDS
-- =============================================

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "payment_records_all_super_admin" ON payment_records
  FOR ALL
  USING (public.is_super_admin());

-- Club staff can manage payment records
CREATE POLICY "payment_records_manage_authenticated" ON payment_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = payment_records.team_id
      AND t.club_id IN (SELECT public.user_club_ids())
    )
  );

-- Parents can view their children's payment records
CREATE POLICY "payment_records_select_parent" ON payment_records
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT pp.player_id
      FROM player_parents pp
      WHERE pp.parent_user_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES - ANNOUNCEMENTS
-- =============================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public can view published public announcements
CREATE POLICY "announcements_select_public" ON announcements
  FOR SELECT
  USING (status = 'published' AND visibility = 'public');

-- Super admins can do everything
CREATE POLICY "announcements_all_super_admin" ON announcements
  FOR ALL
  USING (public.is_super_admin());

-- Authenticated users can view published member announcements
CREATE POLICY "announcements_select_authenticated" ON announcements
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    (visibility = 'public' OR visibility = 'members' OR
     (visibility = 'team_specific' AND
      target_teams && ARRAY(
        SELECT tp.team_id FROM team_players tp
        JOIN players p ON p.id = tp.player_id
        LEFT JOIN player_parents pp ON pp.player_id = p.id
        WHERE tp.player_id IN (
          SELECT id FROM players WHERE club_id IN (SELECT public.user_club_ids())
        )
        OR pp.parent_user_id = auth.uid()
      )
    ))
  );

-- Club staff can manage announcements
CREATE POLICY "announcements_manage_authenticated" ON announcements
  FOR ALL
  TO authenticated
  USING (club_id IN (SELECT public.user_club_ids()));

-- =============================================
-- RLS POLICIES - MEDIA GALLERY
-- =============================================

ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;

-- Public can view public media
CREATE POLICY "media_gallery_select_public" ON media_gallery
  FOR SELECT
  USING (visibility = 'public');

-- Super admins can do everything
CREATE POLICY "media_gallery_all_super_admin" ON media_gallery
  FOR ALL
  USING (public.is_super_admin());

-- Authenticated users can view member media
CREATE POLICY "media_gallery_select_authenticated" ON media_gallery
  FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR visibility = 'members');

-- Club staff can manage media
CREATE POLICY "media_gallery_manage_authenticated" ON media_gallery
  FOR ALL
  TO authenticated
  USING (club_id IN (SELECT public.user_club_ids()));

-- =============================================
-- RLS POLICIES - NOTIFICATIONS
-- =============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "notifications_all_super_admin" ON notifications
  FOR ALL
  USING (public.is_super_admin());

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert notifications for any user
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- RLS POLICIES - NOTIFICATION PREFERENCES
-- =============================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "notification_preferences_all_super_admin" ON notification_preferences
  FOR ALL
  USING (public.is_super_admin());

-- Users can manage their own preferences
CREATE POLICY "notification_preferences_own" ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_subscription_fees_updated_at
  BEFORE UPDATE ON subscription_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_gallery_updated_at
  BEFORE UPDATE ON media_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
