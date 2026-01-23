-- DEBUG SYSTEM
-- Create a temporary log table to trace Trigger execution
CREATE TABLE IF NOT EXISTS _debug_logs (
    id SERIAL PRIMARY KEY,
    message TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Enable RLS but allow everyone to insert/read (for debugging only)
ALTER TABLE _debug_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Debug" ON _debug_logs FOR ALL USING (true);
-- REDEFINE TRIGGER WITH LOGGING
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
sys_error text;
BEGIN
INSERT INTO _debug_logs (message, details)
VALUES ('Trigger Started', 'Email: ' || new.email);
BEGIN
SELECT * INTO whitelist_entry
FROM allowed_users
WHERE email = new.email;
INSERT INTO _debug_logs (message, details)
VALUES (
        'Whitelist Check',
        'Found: ' || CASE
            WHEN whitelist_entry IS NULL THEN 'NO'
            ELSE 'YES'
        END
    );
IF whitelist_entry IS NOT NULL THEN -- APROBADO
INSERT INTO public.profiles (id, email, full_name, cedula, phone)
VALUES (
        new.id,
        new.email,
        whitelist_entry.full_name,
        whitelist_entry.cedula,
        whitelist_entry.phone
    ) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name;
INSERT INTO _debug_logs (message, details)
VALUES ('Profile Created', 'Approved User');
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
INSERT INTO _debug_logs (message, details)
VALUES (
        'Role Assigned',
        'Role: ' || COALESCE(whitelist_entry.assigned_role, 'fan')
    );
ELSE -- DENEGADO (PENDING)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO _debug_logs (message, details)
VALUES ('Role Assigned', 'Role: pending');
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
INSERT INTO _debug_logs (message, details)
VALUES ('Profile Created', 'Pending User');
END IF;
EXCEPTION
WHEN OTHERS THEN GET STACKED DIAGNOSTICS sys_error = MESSAGE_TEXT;
INSERT INTO _debug_logs (message, details)
VALUES ('CRITICAL ERROR', sys_error);
RAISE EXCEPTION 'Trigger Error: %',
sys_error;
-- Re-throw to fail transaction
END;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;