-- FIX: Allow anonymous updates to 'teams' table for Demo/Testing phase
-- The error "Cannot coerce the result to a single JSON object" happens because 
-- RLS prevents the update, so 0 rows are returned, failing the .single() check.
-- Enable RLS (if not already) to ensure policies logic applies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- Drop existing restrictive policy if any specific one exists (generic safeguard)
DROP POLICY IF EXISTS "Public Update Teams" ON teams;
-- Create permissive policy for Demo Mode
CREATE POLICY "Public Update Teams" ON teams FOR
UPDATE TO public USING (true) WITH CHECK (true);
-- Ensure Insert is also allowed if we ever need to add teams (optional but good for consistency)
CREATE POLICY "Public Insert Teams" ON teams FOR
INSERT TO public WITH CHECK (true);