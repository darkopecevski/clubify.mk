-- =============================================
-- SEED DATA FOR PLAYERS AND COACHES
-- =============================================
-- Run this after the player management migration

-- Get the club ID for FK Akademija Skopje
DO $$
DECLARE
  akademija_club_id UUID;
  u10_team_id UUID;
  u12_team_id UUID;
BEGIN
  -- Get club and team IDs
  SELECT id INTO akademija_club_id FROM clubs WHERE slug = 'fk-akademija-skopje';
  SELECT id INTO u10_team_id FROM teams WHERE name = 'U10 Eagles' AND club_id = akademija_club_id;
  SELECT id INTO u12_team_id FROM teams WHERE name = 'U12 Tigers' AND club_id = akademija_club_id;

  -- Insert sample players for U10 team
  INSERT INTO players (club_id, first_name, last_name, date_of_birth, gender, position, dominant_foot, jersey_number, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
  VALUES
    (akademija_club_id, 'Stefan', 'Petrovski', '2015-03-15', 'male', 'Forward', 'right', 9, 'Marija Petrovska', '+38970111111', 'mother'),
    (akademija_club_id, 'Nikola', 'Dimitriev', '2015-06-22', 'male', 'Midfielder', 'left', 10, 'Ana Dimitrieva', '+38970222222', 'mother'),
    (akademija_club_id, 'Aleksandar', 'Stojanovski', '2015-01-10', 'male', 'Defender', 'right', 5, 'Ivana Stojanovska', '+38970333333', 'mother'),
    (akademija_club_id, 'David', 'Ilievski', '2015-09-05', 'male', 'Goalkeeper', 'right', 1, 'Elena Ilievska', '+38970444444', 'mother'),
    (akademija_club_id, 'Filip', 'Georgievski', '2015-04-18', 'male', 'Midfielder', 'both', 7, 'Sonja Georgievska', '+38970555555', 'mother');

  -- Insert sample players for U12 team
  INSERT INTO players (club_id, first_name, last_name, date_of_birth, gender, position, dominant_foot, jersey_number, blood_type, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
  VALUES
    (akademija_club_id, 'Marko', 'Todorovski', '2013-02-14', 'male', 'Forward', 'right', 11, 'O+', 'Biljana Todorovska', '+38970666666', 'mother'),
    (akademija_club_id, 'Luka', 'Kostovski', '2013-07-30', 'male', 'Midfielder', 'right', 8, 'A+', 'Katerina Kostovska', '+38970777777', 'mother'),
    (akademija_club_id, 'Andrej', 'Nikolovski', '2013-11-12', 'male', 'Defender', 'left', 4, 'B+', 'Vesna Nikolovska', '+38970888888', 'mother');

  -- Assign players to teams
  INSERT INTO team_players (team_id, player_id, joined_at, is_active)
  SELECT u10_team_id, p.id, '2024-09-01', true
  FROM players p
  WHERE p.date_of_birth >= '2015-01-01' AND p.club_id = akademija_club_id;

  INSERT INTO team_players (team_id, player_id, joined_at, is_active)
  SELECT u12_team_id, p.id, '2024-09-01', true
  FROM players p
  WHERE p.date_of_birth < '2015-01-01' AND p.club_id = akademija_club_id;

END $$;

-- Note: To add coaches, you need to first create user accounts for them
-- through the Auth system, then link them as coaches. This would be done
-- through the application UI. For now, we'll leave coaches empty.
--
-- Example workflow for adding a coach:
-- 1. User signs up through the app (creates auth.users record)
-- 2. Auto-creates entry in users table (via trigger)
-- 3. Admin assigns coach role in user_roles table
-- 4. Admin creates coach profile in coaches table
-- 5. Admin assigns coach to team in team_coaches table
