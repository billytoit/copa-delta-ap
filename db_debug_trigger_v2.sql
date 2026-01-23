-- DEBUG SYSTEM V2 (NO-CRASH)
-- Update Trigger to NOT raise exception, allowing us to see the logs even if logic fails.
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
-- DO NOT RAISE ERROR. Just log it.
INSERT INTO _debug_logs (message, details)
VALUES ('CRITICAL ERROR SWALLOWED', sys_error);
END;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;