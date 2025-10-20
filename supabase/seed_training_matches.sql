-- =============================================
-- SEED DATA FOR TRAINING & MATCHES
-- =============================================
-- Run this after the training and matches migration

DO $$
DECLARE
  akademija_club_id UUID;
  u10_team_id UUID;
  u12_team_id UUID;
  player1_id UUID;
  player2_id UUID;
  player3_id UUID;
  recurrence1_id UUID;
  session1_id UUID;
  session2_id UUID;
  match1_id UUID;
BEGIN
  -- Get club and team IDs
  SELECT id INTO akademija_club_id FROM clubs WHERE slug = 'fk-akademija-skopje';
  SELECT id INTO u10_team_id FROM teams WHERE name = 'U10 Eagles' AND club_id = akademija_club_id;
  SELECT id INTO u12_team_id FROM teams WHERE name = 'U12 Tigers' AND club_id = akademija_club_id;

  -- Get some player IDs
  SELECT id INTO player1_id FROM players WHERE first_name = 'Stefan' AND last_name = 'Petrovski';
  SELECT id INTO player2_id FROM players WHERE first_name = 'Nikola' AND last_name = 'Dimitriev';
  SELECT id INTO player3_id FROM players WHERE first_name = 'Marko' AND last_name = 'Todorovski';

  -- =============================================
  -- TRAINING RECURRENCES
  -- =============================================

  -- U10 Team: Monday and Wednesday at 5pm
  INSERT INTO training_recurrences (team_id, day_of_week, start_time, duration_minutes, location, notes)
  VALUES
    (u10_team_id, 1, '17:00', 90, 'Main Training Ground', 'Focus on fundamentals and ball control')
  RETURNING id INTO recurrence1_id;

  INSERT INTO training_recurrences (team_id, day_of_week, start_time, duration_minutes, location, notes)
  VALUES
    (u10_team_id, 3, '17:00', 90, 'Main Training Ground', 'Tactical drills and small-sided games');

  -- U12 Team: Tuesday and Thursday at 6pm
  INSERT INTO training_recurrences (team_id, day_of_week, start_time, duration_minutes, location, notes)
  VALUES
    (u12_team_id, 2, '18:00', 120, 'Main Training Ground', 'Technical skills and match preparation'),
    (u12_team_id, 4, '18:00', 120, 'Main Training Ground', 'Strength conditioning and tactics');

  -- =============================================
  -- TRAINING SESSIONS
  -- =============================================

  -- Past session for U10 (last Monday)
  INSERT INTO training_sessions (
    team_id,
    recurrence_id,
    session_date,
    start_time,
    duration_minutes,
    location,
    focus_areas,
    notes
  )
  VALUES (
    u10_team_id,
    recurrence1_id,
    CURRENT_DATE - INTERVAL '6 days',
    '17:00',
    90,
    'Main Training Ground',
    ARRAY['passing', 'dribbling', 'positioning'],
    'Great energy from the team today'
  )
  RETURNING id INTO session1_id;

  -- Upcoming session for U10 (next Monday)
  INSERT INTO training_sessions (
    team_id,
    recurrence_id,
    session_date,
    start_time,
    duration_minutes,
    location,
    focus_areas
  )
  VALUES (
    u10_team_id,
    recurrence1_id,
    CURRENT_DATE + INTERVAL '1 day',
    '17:00',
    90,
    'Main Training Ground',
    ARRAY['shooting', 'finishing', 'set_pieces']
  )
  RETURNING id INTO session2_id;

  -- Past session for U12
  INSERT INTO training_sessions (
    team_id,
    session_date,
    start_time,
    duration_minutes,
    location,
    focus_areas
  )
  VALUES (
    u12_team_id,
    CURRENT_DATE - INTERVAL '3 days',
    '18:00',
    120,
    'Main Training Ground',
    ARRAY['tactics', 'match_preparation', 'set_pieces']
  );

  -- =============================================
  -- ATTENDANCE RECORDS
  -- =============================================

  -- Attendance for past U10 session
  INSERT INTO attendance (training_session_id, player_id, status, arrival_time, notes)
  SELECT
    session1_id,
    p.id,
    CASE
      WHEN p.first_name = 'Stefan' THEN 'present'
      WHEN p.first_name = 'Nikola' THEN 'late'
      WHEN p.first_name = 'Aleksandar' THEN 'present'
      WHEN p.first_name = 'David' THEN 'present'
      WHEN p.first_name = 'Filip' THEN 'excused'
    END,
    CASE
      WHEN p.first_name = 'Nikola' THEN '17:15'::TIME
      WHEN p.first_name != 'Filip' THEN '17:00'::TIME
    END,
    CASE
      WHEN p.first_name = 'Filip' THEN 'Doctor appointment'
      WHEN p.first_name = 'Nikola' THEN 'Traffic delay'
    END
  FROM players p
  WHERE p.date_of_birth >= '2015-01-01' AND p.club_id = akademija_club_id;

  -- =============================================
  -- MATCHES
  -- =============================================

  -- Completed match
  INSERT INTO matches (
    home_team_id,
    away_team_name,
    match_date,
    start_time,
    location,
    competition,
    home_score,
    away_score,
    status,
    notes
  )
  VALUES (
    u10_team_id,
    'FK Pelister Youth U10',
    CURRENT_DATE - INTERVAL '7 days',
    '10:00',
    'Akademija Stadium',
    'League',
    3,
    2,
    'completed',
    'Great comeback victory in the second half'
  )
  RETURNING id INTO match1_id;

  -- Upcoming match
  INSERT INTO matches (
    home_team_id,
    away_team_name,
    match_date,
    start_time,
    location,
    competition,
    status
  )
  VALUES (
    u10_team_id,
    'FK Vardar Youth U10',
    CURRENT_DATE + INTERVAL '5 days',
    '11:00',
    'Akademija Stadium',
    'League',
    'scheduled'
  );

  -- U12 match
  INSERT INTO matches (
    home_team_id,
    away_team_name,
    match_date,
    start_time,
    location,
    competition,
    home_score,
    away_score,
    status
  )
  VALUES (
    u12_team_id,
    'FK Rabotnicki Youth U12',
    CURRENT_DATE - INTERVAL '4 days',
    '14:00',
    'Akademija Stadium',
    'Cup',
    2,
    1,
    'completed'
  );

  -- =============================================
  -- MATCH SQUADS
  -- =============================================

  -- Squad for completed U10 match
  INSERT INTO match_squads (match_id, player_id, is_starting, jersey_number, position, minutes_played)
  SELECT
    match1_id,
    p.id,
    CASE
      WHEN p.first_name IN ('Stefan', 'Nikola', 'Aleksandar', 'David') THEN true
      ELSE false
    END,
    p.jersey_number,
    p.position,
    CASE
      WHEN p.first_name IN ('Stefan', 'Nikola', 'Aleksandar', 'David') THEN 60
      WHEN p.first_name = 'Filip' THEN 30
      ELSE 0
    END
  FROM players p
  WHERE p.date_of_birth >= '2015-01-01' AND p.club_id = akademija_club_id;

  -- =============================================
  -- MATCH STATISTICS
  -- =============================================

  -- Statistics for completed match
  INSERT INTO match_statistics (match_id, player_id, goals, assists, yellow_cards, rating, notes)
  VALUES
    (match1_id, player1_id, 2, 1, 0, 8.5, 'Man of the match - excellent finishing'),
    (match1_id, player2_id, 1, 1, 0, 8.0, 'Great vision and passing');

  -- Add more statistics for other players
  INSERT INTO match_statistics (match_id, player_id, goals, assists, yellow_cards, rating)
  SELECT
    match1_id,
    p.id,
    0,
    0,
    0,
    CASE
      WHEN p.position = 'Goalkeeper' THEN 7.5
      WHEN p.position = 'Defender' THEN 7.0
      ELSE 6.5
    END
  FROM players p
  WHERE p.date_of_birth >= '2015-01-01'
    AND p.club_id = akademija_club_id
    AND p.id NOT IN (player1_id, player2_id);

END $$;
