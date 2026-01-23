-- TEST SETUP: Roles & Whitelist
-- 1. PRE-BAKE the new Admin (lovocomunicaciones) in the Whitelist
-- This ensures that when this person Signs Up, the Trigger finds them and acts.
INSERT INTO public.allowed_users (email, full_name, assigned_role)
VALUES (
        'lovocomunicaciones@gmail.com',
        'Administrador Principal',
        'admin'
    ) ON CONFLICT (email) DO
UPDATE
SET assigned_role = 'admin';
-- 2. DOWNGRADE 'bhiggins.p' to Player
-- We manually update the role since the user already exists.
UPDATE public.user_roles
SET role = 'player'
WHERE email = 'bhiggins.p@gmail.com';
-- 3. (Optional) Ensure 'bhiggins.p' is also in allowed_users so they don't get blocked if they re-trigger verification
INSERT INTO public.allowed_users (email, full_name, assigned_role)
VALUES (
        'bhiggins.p@gmail.com',
        'Billy Higgins',
        'player'
    ) ON CONFLICT (email) DO NOTHING;