-- Add additional fields to clubs table
ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT CHECK (char_length(description) <= 1000);

-- Add comments
COMMENT ON COLUMN clubs.founded_year IS 'Year the club was founded';
COMMENT ON COLUMN clubs.logo_url IS 'URL to the club logo image';
COMMENT ON COLUMN clubs.description IS 'Brief description of the club (max 1000 characters)';
