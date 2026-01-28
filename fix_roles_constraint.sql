-- FIX: Expand valid roles in user_roles table
-- This adds 'dirigente' and 'veedor' to the allowlist of roles.
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check CHECK (
        role IN (
            'admin',
            'player',
            'official',
            'veedor',
            'arbitro',
            'operador',
            'operator',
            'dirigente',
            'fan',
            'invitado',
            'pending'
        )
    );
-- Standardize roles for existing users to lowercase
UPDATE public.user_roles
SET role = LOWER(role);
-- Ensure Xavier and others are updated if they were stuck
-- (You might want to run your repair function after this)
SELECT 'Constraint updated successfully' as result;