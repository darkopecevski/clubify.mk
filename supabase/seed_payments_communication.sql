-- =============================================
-- SEED DATA FOR PAYMENTS & COMMUNICATION
-- =============================================
-- Run this after Phase 1.4 migration

DO $$
DECLARE
  akademija_club_id UUID;
  u10_team_id UUID;
  u12_team_id UUID;
  stefan_id UUID;
  nikola_id UUID;
  marko_id UUID;
  coach1_user_id UUID;
  parent1_user_id UUID;
BEGIN
  -- Get club and team IDs
  SELECT id INTO akademija_club_id FROM clubs WHERE slug = 'fk-akademija-skopje';
  SELECT id INTO u10_team_id FROM teams WHERE name = 'U10 Eagles' AND club_id = akademija_club_id;
  SELECT id INTO u12_team_id FROM teams WHERE name = 'U12 Tigers' AND club_id = akademija_club_id;

  -- Get player IDs
  SELECT id INTO stefan_id FROM players WHERE first_name = 'Stefan' AND last_name = 'Petrovski';
  SELECT id INTO nikola_id FROM players WHERE first_name = 'Nikola' AND last_name = 'Dimitriev';
  SELECT id INTO marko_id FROM players WHERE first_name = 'Marko' AND last_name = 'Todorovski';

  -- Get user IDs
  SELECT user_id INTO coach1_user_id FROM coaches WHERE license_number = 'MK-UEFA-B-2019-1234' LIMIT 1;
  SELECT parent_user_id INTO parent1_user_id FROM player_parents WHERE player_id = stefan_id LIMIT 1;

  -- =============================================
  -- SUBSCRIPTION FEES
  -- =============================================

  -- U10 Team: 2000 MKD per month (started Sep 2024)
  INSERT INTO subscription_fees (team_id, amount, currency, effective_from, notes)
  VALUES
    (u10_team_id, 2000.00, 'MKD', '2024-09-01', 'Standard monthly fee for U10 team');

  -- U12 Team: 2500 MKD per month (started Sep 2024)
  INSERT INTO subscription_fees (team_id, amount, currency, effective_from, notes)
  VALUES
    (u12_team_id, 2500.00, 'MKD', '2024-09-01', 'Standard monthly fee for U12 team');

  -- =============================================
  -- DISCOUNTS
  -- =============================================

  -- Nikola gets a 10% merit discount for excellent performance
  INSERT INTO discounts (
    player_id,
    discount_type,
    discount_value,
    reason,
    description,
    effective_from
  )
  VALUES (
    nikola_id,
    'percentage',
    10.00,
    'merit',
    'Excellent performance and attendance in Q3 2024',
    '2024-10-01'
  );

  -- =============================================
  -- PAYMENT RECORDS
  -- =============================================

  -- Generate payment records for September 2024
  INSERT INTO payment_records (
    player_id,
    team_id,
    period_month,
    period_year,
    amount_due,
    amount_paid,
    discount_applied,
    status,
    due_date,
    paid_date,
    payment_method
  )
  SELECT
    p.id,
    tp.team_id,
    9, -- September
    2024,
    CASE
      WHEN tp.team_id = u10_team_id THEN 2000.00
      WHEN tp.team_id = u12_team_id THEN 2500.00
    END,
    CASE
      WHEN tp.team_id = u10_team_id THEN 2000.00
      WHEN tp.team_id = u12_team_id THEN 2500.00
    END,
    0.00,
    'paid',
    '2024-09-05',
    '2024-09-03',
    'bank_transfer'
  FROM team_players tp
  JOIN players p ON p.id = tp.player_id
  WHERE tp.is_active = true
    AND p.club_id = akademija_club_id;

  -- Generate payment records for October 2024 (with Nikola's discount)
  INSERT INTO payment_records (
    player_id,
    team_id,
    period_month,
    period_year,
    amount_due,
    amount_paid,
    discount_applied,
    status,
    due_date
  )
  SELECT
    p.id,
    tp.team_id,
    10, -- October
    2024,
    CASE
      WHEN tp.team_id = u10_team_id AND p.id = nikola_id THEN 1800.00 -- 10% discount
      WHEN tp.team_id = u10_team_id THEN 2000.00
      WHEN tp.team_id = u12_team_id THEN 2500.00
    END,
    0.00,
    CASE
      WHEN p.id = nikola_id THEN 200.00
      ELSE 0.00
    END,
    'unpaid',
    '2024-10-05'
  FROM team_players tp
  JOIN players p ON p.id = tp.player_id
  WHERE tp.is_active = true
    AND p.club_id = akademija_club_id;

  -- =============================================
  -- ANNOUNCEMENTS
  -- =============================================

  -- Public announcement
  INSERT INTO announcements (
    club_id,
    author_id,
    title,
    content,
    excerpt,
    visibility,
    status,
    published_at
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    'Welcome to the 2024/2025 Season!',
    'We are excited to announce the start of our new season. Training begins on September 1st for all teams. Please ensure all registration forms are submitted by August 25th. Looking forward to an amazing season!',
    'New season kicks off September 1st - registration deadline August 25th',
    'public',
    'published',
    '2024-08-20 10:00:00+00'
  );

  -- Members-only announcement
  INSERT INTO announcements (
    club_id,
    author_id,
    title,
    content,
    excerpt,
    visibility,
    status,
    published_at
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    'October Payment Reminder',
    'Dear parents, this is a friendly reminder that October subscription fees are due on October 5th. Please use the bank transfer details provided in your welcome pack. Contact us if you need any assistance.',
    'October fees due on October 5th',
    'members',
    'published',
    '2024-10-01 09:00:00+00'
  );

  -- Team-specific announcement for U10
  INSERT INTO announcements (
    club_id,
    author_id,
    title,
    content,
    excerpt,
    visibility,
    target_teams,
    status,
    published_at
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    'U10 Eagles - Weekend Tournament',
    'Great news! Our U10 team has been invited to participate in the City Youth Tournament this Saturday. Match starts at 10 AM at the Central Stadium. All players must arrive by 9:15 AM. Bring your full kit!',
    'U10 tournament this Saturday at 10 AM',
    'team_specific',
    ARRAY[u10_team_id],
    'published',
    '2024-10-15 14:00:00+00'
  );

  -- Draft announcement
  INSERT INTO announcements (
    club_id,
    author_id,
    title,
    content,
    excerpt,
    visibility,
    status
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    'Winter Training Schedule Updates',
    'Draft: Planning to adjust training times for winter months...',
    NULL,
    'members',
    'draft'
  );

  -- =============================================
  -- MEDIA GALLERY
  -- =============================================

  -- Public team photo
  INSERT INTO media_gallery (
    club_id,
    uploaded_by,
    file_url,
    thumbnail_url,
    file_type,
    title,
    description,
    album_name,
    visibility,
    width,
    height
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    '/media/team-photos/u10-2024.jpg',
    '/media/team-photos/u10-2024-thumb.jpg',
    'image',
    'U10 Eagles Team Photo 2024',
    'Official team photo for the 2024/2025 season',
    'Team Photos 2024',
    'public',
    1920,
    1080
  );

  -- Members-only training video
  INSERT INTO media_gallery (
    club_id,
    uploaded_by,
    file_url,
    thumbnail_url,
    file_type,
    title,
    description,
    album_name,
    visibility,
    duration_seconds
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    '/media/videos/passing-drill-tutorial.mp4',
    '/media/videos/passing-drill-tutorial-thumb.jpg',
    'video',
    'Passing Drill Tutorial',
    'Coach Dragan explains the triangle passing drill',
    'Training Videos',
    'members',
    180
  );

  -- =============================================
  -- NOTIFICATIONS
  -- =============================================

  -- Training session notification for parent
  IF parent1_user_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url
    )
    VALUES (
      parent1_user_id,
      'training_created',
      'New Training Session Scheduled',
      'A training session has been scheduled for U10 Eagles on Monday at 17:00',
      '/app/training-sessions'
    );

    -- Payment reminder notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      is_read
    )
    VALUES (
      parent1_user_id,
      'payment_due',
      'Payment Due Reminder',
      'October subscription fee of 2000 MKD is due on October 5th',
      '/app/payments',
      false
    );

    -- Announcement notification (already read)
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      is_read,
      read_at
    )
    VALUES (
      parent1_user_id,
      'announcement_published',
      'New Announcement: Welcome to the 2024/2025 Season!',
      'Check out the latest club announcement',
      '/app/announcements',
      true,
      '2024-08-21 08:30:00+00'
    );
  END IF;

  -- =============================================
  -- NOTIFICATION PREFERENCES
  -- =============================================

  -- Set default notification preferences for parent
  IF parent1_user_id IS NOT NULL THEN
    INSERT INTO notification_preferences (user_id, notification_type, in_app_enabled, email_enabled)
    VALUES
      (parent1_user_id, 'training_created', true, true),
      (parent1_user_id, 'training_cancelled', true, true),
      (parent1_user_id, 'match_created', true, true),
      (parent1_user_id, 'payment_due', true, true),
      (parent1_user_id, 'payment_overdue', true, true),
      (parent1_user_id, 'announcement_published', true, false); -- Only in-app for announcements
  END IF;

  RAISE NOTICE 'Successfully created:';
  RAISE NOTICE '  - 2 subscription fees (U10: 2000 MKD, U12: 2500 MKD)';
  RAISE NOTICE '  - 1 discount (Nikola: 10%% merit)';
  RAISE NOTICE '  - % payment records', (SELECT COUNT(*) FROM payment_records);
  RAISE NOTICE '  - 4 announcements (3 published, 1 draft)';
  RAISE NOTICE '  - 2 media items';
  RAISE NOTICE '  - 3 notifications';
  RAISE NOTICE '  - 6 notification preferences';

END $$;
