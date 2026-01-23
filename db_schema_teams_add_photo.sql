-- Add 'photo' column to teams table for the squad picture
-- This fixes the error: "Could not find the 'photo' column of 'teams'"
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS photo TEXT;
-- Verify
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'teams'
    AND column_name = 'photo';