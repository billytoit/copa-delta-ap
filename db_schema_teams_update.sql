-- Add logo_url column to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- Verify
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'teams'
    AND column_name = 'logo_url';