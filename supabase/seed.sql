-- =============================================
-- SEED DATA FOR TESTING
-- =============================================

-- Note: Run this after the migration
-- This creates sample clubs and will help test the schema

-- Insert sample clubs
INSERT INTO clubs (name, slug, description, contact_email, contact_phone, city, is_active)
VALUES
  (
    'FK Akademija Skopje',
    'fk-akademija-skopje',
    'Youth football academy in Skopje focusing on player development',
    'info@fk-akademija.mk',
    '+38970123456',
    'Skopje',
    true
  ),
  (
    'FK Mladost Strumica',
    'fk-mladost-strumica',
    'Community football club in Strumica',
    'kontakt@mladost-strumica.mk',
    '+38970234567',
    'Strumica',
    true
  ),
  (
    'FK Vinica Youth',
    'fk-vinica-youth',
    'Youth development program in Vinica',
    'info@vinica-youth.mk',
    '+38970345678',
    'Vinica',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample teams for the first club
INSERT INTO teams (club_id, name, age_group, season, is_active)
SELECT
  c.id,
  team.name,
  team.age_group,
  '2024/2025',
  true
FROM clubs c
CROSS JOIN (
  VALUES
    ('U10 Eagles', 'U10'),
    ('U12 Tigers', 'U12'),
    ('U14 Warriors', 'U14'),
    ('U16 Champions', 'U16')
) AS team(name, age_group)
WHERE c.slug = 'fk-akademija-skopje'
ON CONFLICT DO NOTHING;

-- Note: To create users and assign roles, you'll need to:
-- 1. Sign up users through the Auth UI (email/password or OAuth)
-- 2. The handle_new_user() trigger will automatically create their profile
-- 3. Then manually assign roles using the SQL Editor:
--
-- Example: Make a user a super admin
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('[user-uuid-here]', 'super_admin');
--
-- Example: Make a user a club admin
-- INSERT INTO user_roles (user_id, club_id, role)
-- VALUES ('[user-uuid-here]', '[club-uuid-here]', 'club_admin');
