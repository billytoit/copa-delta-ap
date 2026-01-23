-- RESTORE GATEKEEPER TRIGGER
-- Now that RLS policies are fixed, we can restore the robust trigger.
-- This ensures new signups are checked against allowed_users.
CREATE OR REPLACE FUNCTION public.handle_user_verification() RETURNS trigger AS $$
DECLARE whitelist_entry record;
BEGIN -- Check Whitelist
SELECT * INTO whitelist_entry
FROM allowed_users
WHERE email = new.email;
IF whitelist_entry IS NOT NULL THEN -- A. APPROVED USER
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
INSERT INTO public.user_roles (user_id, email, role)
VALUES (
        new.id,
        new.email,
        COALESCE(whitelist_entry.assigned_role, 'fan')
    ) ON CONFLICT (user_id) DO
UPDATE
SET role = EXCLUDED.role;
ELSE -- B. RESTRICTED USER (Pending)
INSERT INTO public.user_roles (user_id, email, role)
VALUES (new.id, new.email, 'pending') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.profiles (id, email)
VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Re-attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_verification();