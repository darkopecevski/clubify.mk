-- Add is_override column to training_sessions table
-- Purpose: Track which sessions have been manually edited and should not be affected by pattern updates

ALTER TABLE training_sessions
ADD COLUMN is_override BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN training_sessions.is_override IS 'True if session has been manually edited (breaks from recurring pattern), false if auto-generated from pattern';
