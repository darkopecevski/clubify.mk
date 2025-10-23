-- Add jersey_number column to team_players table
ALTER TABLE team_players
ADD COLUMN jersey_number INTEGER;

-- Add constraint to ensure jersey number is positive and reasonable
ALTER TABLE team_players
ADD CONSTRAINT team_players_jersey_number_check
CHECK (jersey_number IS NULL OR (jersey_number > 0 AND jersey_number <= 99));

-- Optional: Add unique constraint so same jersey number can't be used twice in same team
-- Commented out for now - some clubs may allow duplicate numbers
-- CREATE UNIQUE INDEX team_players_jersey_unique
-- ON team_players(team_id, jersey_number)
-- WHERE jersey_number IS NOT NULL;
