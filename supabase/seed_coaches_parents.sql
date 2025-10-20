-- =============================================
-- SEED DATA FOR COACHES AND PARENTS
-- =============================================
-- Run this after seed_players.sql

-- Note: This creates dummy user accounts for testing purposes.
-- In production, these would be created through Supabase Auth.

DO $$
DECLARE
  akademija_club_id UUID;
  u10_team_id UUID;
  u12_team_id UUID;

  -- User IDs (we'll generate these)
  coach1_user_id UUID := gen_random_uuid();
  coach2_user_id UUID := gen_random_uuid();
  parent1_user_id UUID := gen_random_uuid();
  parent2_user_id UUID := gen_random_uuid();
  parent3_user_id UUID := gen_random_uuid();

  -- Coach IDs (we'll get these after insert)
  coach1_id UUID;
  coach2_id UUID;

  -- Player IDs (we'll fetch these)
  stefan_id UUID;
  nikola_id UUID;
  marko_id UUID;
BEGIN
  -- Get club and team IDs
  SELECT id INTO akademija_club_id FROM clubs WHERE slug = 'fk-akademija-skopje';
  SELECT id INTO u10_team_id FROM teams WHERE name = 'U10 Eagles' AND club_id = akademija_club_id;
  SELECT id INTO u12_team_id FROM teams WHERE name = 'U12 Tigers' AND club_id = akademija_club_id;

  -- Get some player IDs
  SELECT id INTO stefan_id FROM players WHERE first_name = 'Stefan' AND last_name = 'Petrovski';
  SELECT id INTO nikola_id FROM players WHERE first_name = 'Nikola' AND last_name = 'Dimitriev';
  SELECT id INTO marko_id FROM players WHERE first_name = 'Marko' AND last_name = 'Todorovski';

  -- =============================================
  -- CREATE AUTH USERS (normally done by Supabase Auth)
  -- =============================================

  -- Note: In production, these would be created through Supabase Auth signup
  -- For testing, we create them directly in auth.users and users tables

  -- Insert into auth.users first
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES
    -- Coach 1: dragan@akademija.mk / password: Test123!
    (
      coach1_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'dragan@akademija.mk',
      '$2a$10$XQFZvQ7Z7Z7Z7Z7Z7Z7Z7eXQFZvQ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7', -- dummy hash
      NOW(),
      NOW(),
      NOW(),
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dragan Petkovski"}'
    ),
    -- Coach 2: igor@akademija.mk / password: Test123!
    (
      coach2_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'igor@akademija.mk',
      '$2a$10$XQFZvQ7Z7Z7Z7Z7Z7Z7Z7eXQFZvQ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7',
      NOW(),
      NOW(),
      NOW(),
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Igor Mihajlovski"}'
    ),
    -- Parent 1: marija@example.mk
    (
      parent1_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'marija@example.mk',
      '$2a$10$XQFZvQ7Z7Z7Z7Z7Z7Z7Z7eXQFZvQ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7',
      NOW(),
      NOW(),
      NOW(),
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Marija Petrovska"}'
    ),
    -- Parent 2: ana@example.mk
    (
      parent2_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'ana@example.mk',
      '$2a$10$XQFZvQ7Z7Z7Z7Z7Z7Z7Z7eXQFZvQ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7',
      NOW(),
      NOW(),
      NOW(),
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Ana Dimitrieva"}'
    ),
    -- Parent 3: biljana@example.mk
    (
      parent3_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'biljana@example.mk',
      '$2a$10$XQFZvQ7Z7Z7Z7Z7Z7Z7Z7eXQFZvQ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7',
      NOW(),
      NOW(),
      NOW(),
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Biljana Todorovska"}'
    );

  -- Insert into public.users table (only if not already created by trigger)
  -- Use ON CONFLICT to handle case where trigger already created the records
  INSERT INTO users (id, full_name, phone)
  VALUES
    (coach1_user_id, 'Dragan Petkovski', '+38970123456'),
    (coach2_user_id, 'Igor Mihajlovski', '+38970234567'),
    (parent1_user_id, 'Marija Petrovska', '+38970111111'),
    (parent2_user_id, 'Ana Dimitrieva', '+38970222222'),
    (parent3_user_id, 'Biljana Todorovska', '+38970666666')
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;

  -- =============================================
  -- CREATE USER ROLES
  -- =============================================

  -- Assign coach roles
  INSERT INTO user_roles (user_id, club_id, role)
  VALUES
    (coach1_user_id, akademija_club_id, 'coach'),
    (coach2_user_id, akademija_club_id, 'coach');

  -- Assign parent roles
  INSERT INTO user_roles (user_id, club_id, role)
  VALUES
    (parent1_user_id, akademija_club_id, 'parent'),
    (parent2_user_id, akademija_club_id, 'parent'),
    (parent3_user_id, akademija_club_id, 'parent');

  -- =============================================
  -- CREATE COACHES
  -- =============================================

  INSERT INTO coaches (
    club_id,
    user_id,
    license_type,
    license_number,
    specialization,
    years_of_experience,
    bio
  )
  VALUES (
    akademija_club_id,
    coach1_user_id,
    'UEFA B',
    'MK-UEFA-B-2019-1234',
    'Youth Development',
    8,
    'Experienced youth coach specializing in player development and tactical training. Former professional player with 10 years of experience.'
  )
  RETURNING id INTO coach1_id;

  INSERT INTO coaches (
    club_id,
    user_id,
    license_type,
    license_number,
    specialization,
    years_of_experience,
    bio
  )
  VALUES (
    akademija_club_id,
    coach2_user_id,
    'UEFA C',
    'MK-UEFA-C-2021-5678',
    'Goalkeeping',
    5,
    'Specialized goalkeeping coach with focus on technique and positioning. Certified sports psychologist.'
  )
  RETURNING id INTO coach2_id;

  -- =============================================
  -- ASSIGN COACHES TO TEAMS
  -- =============================================

  -- Assign Dragan as head coach of U10 team
  INSERT INTO team_coaches (team_id, coach_id, role, assigned_at, is_active)
  VALUES
    (u10_team_id, coach1_id, 'head_coach', '2024-08-15', true);

  -- Assign Igor as goalkeeper coach of U10 team
  INSERT INTO team_coaches (team_id, coach_id, role, assigned_at, is_active)
  VALUES
    (u10_team_id, coach2_id, 'goalkeeper_coach', '2024-08-15', true);

  -- Assign Dragan as head coach of U12 team as well
  INSERT INTO team_coaches (team_id, coach_id, role, assigned_at, is_active)
  VALUES
    (u12_team_id, coach1_id, 'head_coach', '2024-08-15', true);

  -- =============================================
  -- LINK PARENTS TO PLAYERS
  -- =============================================

  -- Link Marija to Stefan
  INSERT INTO player_parents (player_id, parent_user_id, relationship)
  VALUES
    (stefan_id, parent1_user_id, 'mother');

  -- Link Ana to Nikola
  INSERT INTO player_parents (player_id, parent_user_id, relationship)
  VALUES
    (nikola_id, parent2_user_id, 'mother');

  -- Link Biljana to Marko
  INSERT INTO player_parents (player_id, parent_user_id, relationship)
  VALUES
    (marko_id, parent3_user_id, 'mother');

  RAISE NOTICE 'Successfully created:';
  RAISE NOTICE '  - 2 coaches (Dragan Petkovski, Igor Mihajlovski)';
  RAISE NOTICE '  - 3 coach-team assignments';
  RAISE NOTICE '  - 3 parents (Marija, Ana, Biljana)';
  RAISE NOTICE '  - 3 parent-player relationships';

END $$;
