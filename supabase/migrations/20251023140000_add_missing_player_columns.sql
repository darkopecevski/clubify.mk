-- Add missing columns to players table that are used in player creation form and CSV import

-- Personal info
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Football info
ALTER TABLE players ADD COLUMN IF NOT EXISTS previous_club TEXT;

-- Medical info
ALTER TABLE players ADD COLUMN IF NOT EXISTS medications TEXT;

-- Add constraints
ALTER TABLE players ADD CONSTRAINT players_email_unique UNIQUE (email);

-- Add index for user_id
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);

-- Comment
COMMENT ON COLUMN players.user_id IS 'Reference to the auth user account for this player (for login access)';
COMMENT ON COLUMN players.nationality IS 'Player nationality';
COMMENT ON COLUMN players.city IS 'Player city of residence';
COMMENT ON COLUMN players.address IS 'Player home address';
COMMENT ON COLUMN players.phone IS 'Player phone number';
COMMENT ON COLUMN players.email IS 'Player email address (for login)';
COMMENT ON COLUMN players.previous_club IS 'Previous club the player played for';
COMMENT ON COLUMN players.medications IS 'Current medications the player is taking';
