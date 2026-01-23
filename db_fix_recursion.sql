-- FIX: Infinite recursion in user_roles policy
-- Problem: "Admin Manage Roles" was FOR ALL, which includes SELECT.
-- The policy definition queried user_roles, triggering itself recursively.
-- Solution: Split "Admin Manage Roles" into specific INSERT/UPDATE/DELETE policies.
-- The inner SELECT inside these policies will only trigger "Read User Roles" (FOR SELECT), avoiding the loop.
DROP POLICY IF EXISTS "Admin Manage Roles" ON user_roles;
-- 1. Insert
-- Only admins can insert new roles
CREATE POLICY "Admin Insert Roles" ON user_roles FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- 2. Update
-- Only admins can update roles
CREATE POLICY "Admin Update Roles" ON user_roles FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- 3. Delete
-- Only admins can delete roles
CREATE POLICY "Admin Delete Roles" ON user_roles FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);