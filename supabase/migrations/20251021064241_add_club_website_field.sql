-- Add website field to clubs table
ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add comment
COMMENT ON COLUMN clubs.website IS 'Club website URL';
