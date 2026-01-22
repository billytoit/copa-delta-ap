-- Safely add 'double_yellow' to event_type check constraint or enum if it exists
-- This ensures that if the database is using an ENUM for event_type, we don't crash when inserting the new type.
DO $$ BEGIN -- Check if the enum type exists
IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'event_type_enum'
) THEN -- Add the value if it doesn't exist
ALTER TYPE event_type_enum
ADD VALUE IF NOT EXISTS 'double_yellow';
END IF;
-- If it's a simple text check constraint (common in some setups), we might need to drop/recreate it
-- Checking for a constraint on match_events table
IF EXISTS (
    SELECT 1
    FROM information_schema.check_constraints
    WHERE constraint_name = 'match_events_event_type_check'
) THEN -- If we needed to update a check constraint, we would do it here. 
-- For now, assuming standard Supabase text or Enum. 
-- The line below is just a placeholder example if we were aggressively fixing constraints:
-- ALTER TABLE match_events DROP CONSTRAINT match_events_event_type_check;
-- ALTER TABLE match_events ADD CONSTRAINT match_events_event_type_check CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'note', 'double_yellow'));
NULL;
END IF;
END $$;