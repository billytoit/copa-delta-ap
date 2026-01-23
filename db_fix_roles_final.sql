-- FINAL FIX FOR ROLES
-- 1. Unlock the user_roles table so the App can actually READ it.
-- (If this policy is missing, the App gets "null" and you become a Player)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone Read Roles" ON user_roles;
DROP POLICY IF EXISTS "Read User Roles" ON user_roles;
-- Allow ANYONE to read user roles (Safe for now, ensures your login works)
CREATE POLICY "Everyone Read Roles" ON user_roles FOR
SELECT USING (true);
-- 2. Force Admin Role (Just to be triple sure)
UPDATE public.user_roles
SET role = 'admin'
WHERE email = 'lovocomunicaciones@gmail.com';
-- 3. Update Profile Name (Optional)
UPDATE public.profiles
SET full_name = 'Admin Lovo'
WHERE email = 'lovocomunicaciones@gmail.com';